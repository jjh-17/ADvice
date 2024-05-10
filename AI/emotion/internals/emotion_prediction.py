from typing import List

from services.text_emotion_prediction import TextEmotionPrediction


class EmoPrediction:
    def __init__(self):
        self.__detector = TextEmotionPrediction()

    def predict_all(self, data: List[str]):
        return self.__detector.predict_all(data)
