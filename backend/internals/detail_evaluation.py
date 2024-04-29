from kss import split_sentences

from services.text_ad_detection import TextAdDetection


class AdEvaluation:
    def __init__(self):
        self.__detector = TextAdDetection()

    def paragraph_ad(self, paragraph: str):
        data = self.__split_string(paragraph)
        ad_result = self.__detector.predict(data)

        result = []
        for i in range(len(data)):
            if ad_result[i] == 1:
                result = result.append(data[i])

        return "".join(result)

    def __split_string(self, paragraph: str):
        sentences = split_sentences(paragraph)
        return sentences
