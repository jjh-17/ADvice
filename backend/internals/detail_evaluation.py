from services.text_ad_detection import TextAdDetection


class DetailEvaluation:
    def __init__(self):
        self.__detector = TextAdDetection()

    def paragraph_ad(self, data):
        ad_result = self.__detector.predict(data)

        return ad_result
