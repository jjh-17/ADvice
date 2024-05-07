from typing import List

from internals.emotion_prediction import EmoPrediction


class EmotionPredictionService:
    # 초기화
    def __init__(self):
        self.__emotion_prediction = EmoPrediction()

    # 데이터 전처리 이후 감정 예측 수행
    async def predict_cnt(self, data: List[str]):
        texts = [
            text.replace("\u200B", "")
            for text in data
        ]

        keys = ["negative", "neutral", "positive"]
        results = await self.predict_cnt_emo(texts)

        return dict(zip(keys, results))

    # 데이터 전처리 이후 요약 예측 수행
    async def predict_summary(self, data: List[str]):
        texts = [
            text.replace("\u200B", "")
            for text in data
        ]

        return await self.predict_summary_emo(texts)

    # 문자열 개수가 1 이상인 경우 감정 예측 수행
    async def predict_cnt_emo(self, texts: List[str]):
        if len(texts) < 1:
            return [0, 0, 0]

        result = self.__emotion_prediction.cnt_emo(texts)
        return result

    # 문자열 개수가 1 이상인 경우 요약 예측 수행
    async def predict_summary_emo(self, texts: List[str]):
        if len(texts) < 1:
            return {
                "negative": [], "neutral": [], "positive": []
            }

        result = self.__emotion_prediction.summarize_emo(texts)
        return result
