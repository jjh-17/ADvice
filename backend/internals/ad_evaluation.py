from services.text_ad_detection import TextAdDetection


class AdEvaluation:
    def __init__(self):
        self.__detector = TextAdDetection()

    async def evaluate_ad(self, data):
        ad_result = self.__detector.predict(data)
        return ad_result
