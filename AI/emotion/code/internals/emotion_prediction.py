from kss import split_sentences

from emotion.code.services.text_emotion_prediction import BERTDataset, BERTClassifier, TextEmotionPrediction


class EmoPrediction:
    def __init__(self):
        self.__detector = TextEmotionPrediction()

    def cnt_emo(self, paragraph: str):
        data = self.__split_string(paragraph)
        emo_result = self.__detector.predict(data)

        return emo_result

    def __split_string(self, paragraph: str):
        sentences = split_sentences(paragraph)
        return sentences
