from kss import split_sentences

from services.text_ad_detection import TextAdDetection


class AdEvaluation:
    def __init__(self):
        self.__detector = TextAdDetection()

    def paragraph_ad(self, paragraph: str):
        data = self.__split_string(paragraph)
        ad_result = self.__detector.predict(data)

        return data, ad_result

    def __split_string(self, paragraph: str):
        sentences = split_sentences(paragraph)
        return sentences
