from functools import reduce

from emotion.code.models.detail_request import Element, DetailRequest
from emotion.code.internals.emotion_prediction import EmoPrediction


class EmotionPredictionService:
    # 초기화
    def __init__(self):
        self.__emotion_prediction = EmoPrediction()

    # 데이터 전처리 이후 감정 예측 수행
    async def predict(self, data: DetailRequest):
        data = [
            {"id": tag.id, "data": tag.data.replace("\u200B", ""), "type": tag.type}
            for tag in data.script
        ]
        return {"emoPrediction": await self.predict_emo(data)}

    # 데이터 중 txt만 추출하여 감정 예측 수행
    async def predict_emo(self, data):
        text = list(filter(lambda tag: tag["type"] == "txt", data))

        if len(text) < 1:
            return -2

        paragraph = "".join(reduce(lambda x, y: x + y, map(lambda x: x["data"], text)))
        result = self.__emotion_prediction.cnt_emo(paragraph)

        return self.emotion_analyze(result[0], result[1], result[2])

    # 감정값 기반 글 성향 분석 결과 반환
    def emotion_analyze(self, cnt_neg, cnt_neu, cnt_pos):
        # 부정/중립/긍정 중 가장 높은 비율을 가지는 것 반환
        result = 0
        if cnt_neg >= cnt_neu + cnt_pos:
            result = -1
        elif cnt_pos >= cnt_neg + cnt_neu:
            result = 1
        return result

emotionService = EmotionPredictionService()
detail_request = DetailRequest(script=[Element(data="안녕"), Element(data="안녕2")])
print(emotionService.predict(detail_request))
