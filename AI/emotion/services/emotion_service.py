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
        return {"emoPrediction": await self.predict_cnt_emo(texts)}

    # 데이터 전처리 이후 요약 예측 수행
    async def predict_summary(self, data: EmotionRequest):
        texts = [
            text.replace("\u200B", "")
            for text in data.script
        ]
        return {"emoSummary": await self.predict_summary_emo(texts)}

    # 문자열 개수가 1 이상인 경우 감정 예측 수행
    async def predict_cnt_emo(self, texts):
        if len(texts) < 1:
            return [0, 0, 0]

        paragraph = "".join(reduce(lambda x, y: x + y, map(lambda x: x, texts)))
        result = self.__emotion_prediction.cnt_emo(paragraph)
        return result

    # 문자열 개수가 1 이상인 경우 요약 예측 수행
    async def predict_summary_emo(self, texts):
        if len(texts) < 1:
            return {
                "negList": [], "neuList": [], "posList": []
            }

        paragraph = "".join(reduce(lambda x, y: x + y, map(lambda x: x, texts)))
        result = self.__emotion_prediction.summarize_emo(paragraph)
        return result
