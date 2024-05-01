import torch
import gluonnlp as nlp
import numpy as np
from torch.utils.data import Dataset, DataLoader
from kobert_tokenizer import KoBERTTokenizer
from fastapi import APIRouter
from starlette.responses import JSONResponse


# 학습/테스트 데이터 전처리를 위한 클래스
class BERTDataset(Dataset):
    def __init__(self, dataset, sent_idx, label_idx, bert_tokenizer, vocab, max_len, pad, pair):
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
    def __init__(self, bert, hidden_size = 768, num_classes = 3, dr_rate = None, params = None):
        super(BERTClassifier, self).__init__()
        self.bert = bert
        self.dr_rate = dr_rate

        self.classifier = torch.nn.Linear(hidden_size , num_classes)
        if dr_rate:
            self.dropout = torch.nn.Dropout(p = dr_rate)

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
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        self.model = (torch.load("./model/KoBERT_emo/emotion_classification_model.pt", map_location=self.device)
                      .to(self.device))
        self.tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1')
        self.vocab = nlp.vocab.BERTVocab.from_sentencepiece(self.tokenizer.vocab_file, padding_token='[PAD]')
        self.tok = self.tokenizer.tokenize    

    # 예측 결과 반환 메서드
    def predict(self, texts):
        cnt_neg, cnt_neu, cnt_pos = 0, 0, 0
        for text in texts:
            result = self.sentence_predict(text)
            if result == -1:
                cnt_neg += 1
            elif result == 0:
                cnt_neu += 1
            else:
                cnt_pos += 1

        return self.emotion_analyze(cnt_neg, cnt_neu, cnt_pos)

    # 감정값 기반 글 성향 분석 결과 반환
    def emotion_analyze(self, cnt_neg, cnt_neu, cnt_pos):
        if cnt_neg >= cnt_neu + cnt_pos:
            return -1
        elif cnt_pos >= cnt_neg + cnt_neu:
            return 1
        return 0

    #  부정 : -1, 중립 : 0, 긍정 : 1
    def sentence_predict(self, sentence):
        # 실수를 치역으로 한 가중치 값을 softmax함수를 사용하여 텍스트를 확률값으로 변환
        def new_softmax(logits):
            c = np.max(logits)              # 최댓값
            exp_logits = np.exp(logits-c)   # 각각의 원소에 최댓값을 뺀 값에 exp를 취한다. (이를 통해 overflow 방지)
            sum_exp_logits = np.sum(exp_logits)
            y = (exp_logits / sum_exp_logits) * 100
            
            return np.round(y, 3)
        
        data = [sentence, '0']
        dataset_another = [data]
        input_dataset = BERTDataset(dataset_another, 0, 1, self.tok, self.vocab, 64, True, False) # 토큰화한 문장
        input_dataloader = DataLoader(input_dataset, batch_size=128, num_workers=0)

        self.model.eval()

        for batch_id, (token_ids, valid_length, segment_ids, label) in enumerate(input_dataloader):
            token_ids = token_ids.long().to(self.device)
            segment_ids = segment_ids.long().to(self.device)
            valid_length= valid_length
            label = label.long().to(self.device)

            with torch.no_grad():
                output = self.model(token_ids, valid_length, segment_ids)
                logits = output.detach().cpu().numpy()
                # logits = np.round(new_softmax(logits), 3).tolist()
        return np.argmax(logits)-1