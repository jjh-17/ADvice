import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import time

class TextAdDetection:
    def __init__(self):
        # self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        self.device = torch.device('cpu')
        self.model = AutoModelForSequenceClassification.from_pretrained("./backend/model/KcELECTRA_ad", num_labels=2).to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained("beomi/KcELECTRA-base")

    def predict(self, texts):
        results = []
        for text in texts:
            results.append(self.sentence_predict(text))

        return results

    #  광고 o : 1, 광고 x : 0
    def sentence_predict(self, sentence):
        self.model.eval()
        tokenized_sent = self.tokenizer(
            sentence,
            return_tensors="pt",
            truncation=True,
            add_special_tokens=True,
            max_length=128
        )

        tokenized_sent.to(self.device)

        with torch.no_grad():
            outputs = self.model(
                input_ids=tokenized_sent["input_ids"],
                attention_mask=tokenized_sent["attention_mask"],
                token_type_ids=tokenized_sent["token_type_ids"]
            )

        logits = outputs[0]
        logits = logits.detach().cpu()
        return 1 if logits.argmax(-1) == 1 else 0
    
texts = [
    "안녕하세요, 여러분!",
    "오늘은 제가 최근에 경험한 특별한 여행 이야기를 여러분과 공유하고 싶어서 글을 적게 되었어요.",
    "바쁜 일상 속에서 잠시 벗어나 자연과 함께한 시간들이었는데, 이 글을 읽으시는 분들께도 작은 여유와 휴식의 시간이 되었으면 좋겠습니다.",
    "제 여행의 목적지는 바로 강원도 속초였어요. ",
    "속초는 바다와 산, 그리고 맛있는 음식으로 유명한 곳이죠. ",
    "특히 이번 여행에서는 속초의 숨겨진 명소와 맛집을 중심으로 다녀보았습니다.",
    "첫째 날, 저는 속초에 도착하자마자 가장 먼저 설악산 국립공원으로 향했습니다. ",
    "설악산은 그 웅장한 자태와 수려한 풍경으로 유명한데요, 저는 케이블카를 타고 권금성에 올랐습니다. ",
    "권금성에서 바라보는 설악산의 풍경은 정말이지 압도적이었어요. ",
    "파란 하늘과 푸른 산이 어우러진 모습이 마치 한 폭의 그림 같았습니다.",
    "산행을 마친 후, 저는 속초 중앙시장으로 발걸음을 옮겼습니다. ",
    "속초 중앙시장하면 빼놓을 수 없는 것이 바로 '닭강정'이죠. ",
    "바삭바삭한 닭강정을 한 입 베어 물면, 달콤하고도 매콤한 맛이 입안 가득 퍼지는데 정말 행복했습니다.",
    "그리고 시장 안에서는 다양한 먹거리가 가득했는데, 오징어 순대와 빙수도 빼놓을 수 없는 별미였습니다.",
    "이튿날, 저는 속초 해수욕장을 방문했습니다. ",
    "아침 일찍 도착해서 사람들이 별로 없는 조용한 해변을 거닐었는데요, 파도 소리만 들리는 고요한 해변을 걷다 보니 모든 걱정과 스트레스가 사르르 녹아내리는 것 같았습니다. ",
    "해변에서 조금 더 걸어가니 아름다운 속초 등대가 보였고, 그 주변으로 잘 정돈된 산책로가 있어 더욱 특별한 시간을 보낼 수 있었어요.",
    "속초에서의 마지막 날, 저는 영금정을 방문했습니다.",
    "영금정은 바다를 바라보며 차를 마실 수 있는 곳으로, 창밖으로 보이는 푸른 바다와 하늘이 정말 장관이었습니다. ",
    "커피 한 잔을 손에 들고 바라보는 바다는 그 어떤 것과도 바꿀 수 없는 평화로움을 선사했습니다.",
    "여행을 마치며 저는 다시 일상으로 돌아가야 했지만, 속초에서의 시간들은 오래도록 제 마음속에 남을 것 같습니다.",
    "때로는 일상에서 벗어나 자연 속에서 시간을 보내며 스스로를 돌아보는 것도 필요하다는 걸 이번 여행을 통해 다시 한번 느꼈습니다.",
    "여러분도 지친 일상에 작은 여유를 가져보시는 건 어떨까요?",
    "당장 속초로 떠나지 않더라도, 주변의 작은 공원이나 조용한 카페에서 시간을 보내며 재충전의 시간을 갖는 것만으로도 큰 도움이 될 거예요. ",
    "여러분의 일상이 더욱 풍요로워지길 바라며, 저는 이만 글을 마치겠습니다. 다음에 또 다른 이야기로 찾아뵐게요.",
    "감사합니다!"
]

start_time = time.time()
detector = TextAdDetection()
middle_time = time.time()
result = detector.predict(texts)
end_time = time.time()

print("문장 개수: " + str(len(texts)))
print("디텍터: " + str(middle_time-start_time))
print("모델: " + str(end_time-middle_time))
print("전체: " + str(end_time-start_time))
for text, r in zip(texts, result):
    print(text + ' : ' + str(r))
