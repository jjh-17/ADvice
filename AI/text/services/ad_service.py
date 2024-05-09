from internals.image_ad_detection import imageDetector
from internals.text_ad_detection import textDetector


class AdService:
    def ad_evaluation(self, texts: list):
        return textDetector.predict(texts)

    def ad_evaluation_shortcut(self, texts: list, image_paths: str):
        text_results = self.ad_evaluation(texts)
        for result in text_results:
            if result == 1:
                return True

        if imageDetector.determine_ad_imageURLs(image_paths):
            return True

        return False


adService = AdService()
