import torch
import gluonnlp as nlp
import numpy as np
from torch.utils.data import Dataset, DataLoader
from kobert_tokenizer import KoBERTTokenizer
from transformers import BertModel


# 학습/테스트 데이터 전처리를 위한 클래스
class BERTDataset(Dataset):
    def __init__(self, dataset, sent_idx, label_idx, bert_tokenizer, vocab, max_len, pad, pair):
        transform = nlp.data.BERTSentenceTransform(bert_tokenizer, max_seq_length=max_len, vocab=vocab, pad=pad, pair=pair)
        self.sentences = [transform([i[sent_idx]]) for i in dataset]
        self.labels = [np.int32(i[label_idx]) for i in dataset]

    def __getitem__(self, i):
        return (self.sentences[i] + (self.labels[i],))

    def __len__(self):
        return (len(self.labels))


# 모델 구조
class BERTClassifier(torch.nn.Module):
    def __init__(self, bert, hidden_size=768, num_classes=3, dr_rate=None, params=None):
        super(BERTClassifier, self).__init__()
        self.bert = bert
        self.dr_rate = dr_rate

        self.classifier = torch.nn.Linear(hidden_size, num_classes)
        if dr_rate:
            self.dropout = torch.nn.Dropout(p=dr_rate)

    def gen_attention_mask(self, token_ids, valid_length):
        attention_mask = torch.zeros_like(token_ids)
        for i, v in enumerate(valid_length):
            attention_mask[i][:v] = 1
        return attention_mask.float()

    def forward(self, token_ids, valid_length, segment_ids):
        attention_mask = self.gen_attention_mask(token_ids, valid_length)

        _, pooler = self.bert(input_ids=token_ids, token_type_ids=segment_ids.long(),
                              attention_mask=attention_mask.float().to(token_ids.device), return_dict=False)
        if self.dr_rate:
            out = self.dropout(pooler)
        return self.classifier(out)


# input 데이터 전처리
class TextEmotionPrediction:
    # 초기화
    def __init__(self):
        self.device = torch.device('cpu')
        bert_model = BertModel.from_pretrained('skt/kobert-base-v1', return_dict=False).to(self.device)
        self.model = BERTClassifier(bert_model, dr_rate=0.5).to(self.device)
        self.model.load_state_dict(torch.load('./model/emotion_classification_weight.pt', map_location=self.device))

        self.tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1')
        self.vocab = nlp.vocab.BERTVocab.from_sentencepiece(self.tokenizer.vocab_file, padding_token='[PAD]')
        self.tok = self.tokenizer.tokenize

    # 전체 글에서 부정, 중립, 긍정 글 개수 반환
    def predict_cnt(self, texts):
        cnt_neg, cnt_neu, cnt_pos = 0, 0, 0
        for text in texts:
            result = self.sentence_predict(text)
            print(result)
            if result[1] == -1:
                cnt_neg += 1
            elif result[1] == 0:
                cnt_neu += 1
            else:
                cnt_pos += 1
        return [cnt_neg, cnt_neu, cnt_pos]

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
                logits = np.round(self.new_softmax(logits), 3).tolist()
        return [np.max(logits), np.argmax(logits) - 1]

    # 실수를 치역으로 한 가중치 값을 softmax함수를 사용하여 텍스트를 확률값으로 변환
    def new_softmax(self, a):
        c = np.max(a)  # 최댓값
        exp_a = np.exp(a - c)  # 각각의 원소에 최댓값을 뺀 값에 exp를 취한다. (이를 통해 overflow 방지)
        sum_exp_a = np.sum(exp_a)
        y = (exp_a / sum_exp_a) * 100
        return np.round(y, 3)
