from functools import reduce

from models.emotion_request import EmotionRequest
from internals.emotion_prediction import EmoPrediction


class EmotionPredictionService:
    # 초기화
    def __init__(self):
        self.__emotion_prediction = EmoPrediction()

    # 데이터 전처리 이후 감정 예측 수행
    async def predict_cnt(self, data: EmotionRequest):
        texts = [
            text.replace("\u200B", "")
            for text in data.script
        ]
        return {"emoPrediction": await self.predict_emo(texts)}

    # 데이터 중 txt만 추출하여 감정 예측 수행
    async def predict_emo(self, texts):
        if len(texts) < 1:
            return [0, 0, 0]

        paragraph = "".join(reduce(lambda x, y: x + y, map(lambda x: x, texts)))
        result = self.__emotion_prediction.cnt_emo(paragraph)

        return [result[0], result[1], result[2]]
