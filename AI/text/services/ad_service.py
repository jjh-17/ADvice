from internals.image_analyzer import imageDetector
from internals.text_analyzer import adDetector
from models.exception.custom_exception import CustomException


class AdService:
    def ad_evaluation(self, texts: list):
        return adDetector.detect_texts(texts)

    def ad_evaluation_shortcut(self, texts: list, image_paths: str):
        text_results = self.ad_evaluation(texts)
        for result in text_results:
            if result == 1:
                return True

        # text에 광고 글이 없다면 image에서 판단하여 결과 반환
        if not image_paths:
            return False
        return imageDetector.determine_ad_imageURLs(image_paths)


adService = AdService()
