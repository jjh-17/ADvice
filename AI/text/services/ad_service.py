from internals.text_ad_detection import textDetector


class AdService:
    def ad_evaluation(self, texts: list):
        return textDetector.predict(texts)

    def ad_evaluation_shortcut(self, texts: list, image_paths: str):
        return


adService = AdService()
