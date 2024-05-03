from kss import split_sentences

from services.text_emotion_prediction import TextEmotionPrediction


class EmoPrediction:
    def __init__(self):
        self.__detector = TextEmotionPrediction()

    def cnt_emo(self, paragraph: str):
        data = self.__split_string(paragraph)
        emo_result = self.__detector.predict_cnt(data)
        return emo_result

    def summarize_emo(self, paragraph: str):
        data = self.__split_string(paragraph)
        summarize_result = self.__detector.predict_summary(data)
        return summarize_result

    def __split_string(self, paragraph: str):
        sentences = split_sentences(paragraph)
        return sentences
