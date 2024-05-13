import torch
import gluonnlp as nlp
import numpy as np
from torch.quantization import QuantStub, DeQuantStub
from torch.quantization import get_default_qconfig, float_qparams_weight_only_qconfig
from torch.quantization import prepare, convert
from torch.utils.data import Dataset, DataLoader
from kobert_tokenizer import KoBERTTokenizer
from transformers import BertModel


# 학습/테스트 데이터 전처리를 위한 클래스
class BERTDataset(Dataset):
    def __init__(self, dataset, sent_idx, label_idx, bert_tokenizer, vocab, max_len,
                 pad, pair):
        transform = nlp.data.BERTSentenceTransform(
            bert_tokenizer, max_seq_length=max_len, vocab=vocab, pad=pad, pair=pair)

        self.sentences = [transform([i[sent_idx]]) for i in dataset]
        self.labels = [np.int32(i[label_idx]) for i in dataset]

    def __getitem__(self, i):
        return (self.sentences[i] + (self.labels[i], ))

    def __len__(self):
        return (len(self.labels))


# 모델 구조
class BERTClassifier(torch.nn.Module):
    def __init__(self, bert, hidden_size=768, num_classes=3, dr_rate=None):
        super(BERTClassifier, self).__init__()
        self.bert = bert
        self.classifier = torch.nn.Linear(hidden_size, num_classes)
        self.quant = QuantStub()  # 양자화 스텁
        self.dequant = DeQuantStub()  # 역양자화 스텁
        self.dr_rate = dr_rate
        if dr_rate:
            self.dropout = torch.nn.Dropout(p=dr_rate)

    def forward(self, token_ids, valid_length, segment_ids):
        attention_mask = self.gen_attention_mask(token_ids, valid_length)
        # 여기서는 quant를 bert의 출력에 적용합니다.
        _, pooler = self.bert(input_ids=token_ids.long(), token_type_ids=segment_ids.long(),
                              attention_mask=attention_mask.float().to(token_ids.device),
                              return_dict=False)
        pooler = self.quant(pooler)  # 양자화 적용
        if self.dr_rate:
            pooler = self.dropout(pooler)
        logits = self.classifier(pooler)
        logits = self.dequant(logits)  # 역양자화 적용
        return logits

    def gen_attention_mask(self, token_ids, valid_length):
        attention_mask = torch.zeros_like(token_ids)
        for i, v in enumerate(valid_length):
            attention_mask[i][:v] = 1
        return attention_mask.float()


# input 데이터 전처리
class TextEmotionQuantPrediction:
    def __init__(self):
        self.device = torch.device('cpu')
        self.model = self.__init_model()
        self.tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1')
        self.vocab = nlp.vocab.BERTVocab.from_sentencepiece(self.tokenizer.vocab_file, padding_token='[PAD]')
        self.tok = self.tokenizer.tokenize

    # 모델 초기화
    def __init_model(self):
        model = BertModel.from_pretrained('skt/kobert-base-v1', return_dict=False).to(self.device)

        # 양자화 설정을 모델에 적용
        default_qconfig = get_default_qconfig('fbgemm')
        for name, module in model.named_modules():
            if isinstance(module, torch.nn.Embedding):
                module.qconfig = float_qparams_weight_only_qconfig
            elif isinstance(module, torch.nn.LayerNorm):
                module.qconfig = None  # LayerNorm을 양자화에서 제외
            else:
                module.qconfig = default_qconfig

        # 양자화 준비
        prepare(model, inplace=True)
        model = convert(model)

        state_dict = torch.load('./model/emotion_classification_quantized_weight.pt', map_location=self.device)
        print(state_dict.keys)
        model.load_state_dict(state_dict)

        return model

    #  가장 높은 확률의 감정값 반환
    def sentence_predict(self, sentence):
        data = [sentence, '0']
        dataset_another = [data]
        input_dataset = BERTDataset(dataset_another, 0, 1, self.tok, self.vocab, 64, True, False)  # 토큰화한 문장
        input_dataloader = DataLoader(input_dataset, batch_size=128, num_workers=0)

        self.model.eval()

        for batch_id, (token_ids, valid_length, segment_ids, label) in enumerate(input_dataloader):
            token_ids = token_ids.long().to(self.device)
            segment_ids = segment_ids.long().to(self.device)
            valid_length = valid_length
            with torch.no_grad():
                output = self.model(token_ids, valid_length, segment_ids)
                logits = output[0].detach().cpu().numpy()
                logits = np.round(self.__new_softmax(logits), 3).tolist()
        return [np.max(logits), np.argmax(logits) - 1]

    # 실수를 치역으로 한 가중치 값을 softmax함수를 사용하여 텍스트를 확률값으로 변환
    def __new_softmax(self, a):
        c = np.max(a)  # 최댓값
        exp_a = np.exp(a - c)  # 각각의 원소에 최댓값을 뺀 값에 exp를 취한다. (이를 통해 overflow 방지)
        sum_exp_a = np.sum(exp_a)
        y = (exp_a / sum_exp_a) * 100
        return np.round(y, 3)
