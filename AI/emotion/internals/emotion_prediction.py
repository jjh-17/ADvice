from typing import List

from services.text_emotion_prediction import TextEmotionPrediction


class EmoPrediction:
    def __init__(self):
        self.__detector = TextEmotionPrediction()

    def cnt_emo(self, data: List[str]):
        emo_result = self.__detector.predict_cnt(data)
        return emo_result

    def summarize_emo(self, data: List[str]):
        summarize_result = self.__detector.predict_summary(data)
        return summarize_result
