from typing import List

from internals.emotion_prediction import EmoPrediction


class EmotionPredictionService:
    # 초기화
    def __init__(self):
        self.__emotion_prediction = EmoPrediction()

    # 데이터 전처리 이후 감정 예측 수행
    async def predict_all(self, data: List[str]):
        texts = [
            text.replace("\u200B", "")
            for text in data
        ]

        keys = ["negative", "neutral", "positive"]
        results = self.__emotion_prediction.predict_all(texts)

        return dict(zip(keys, results))