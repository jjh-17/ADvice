from google.cloud import vision

from config.config import settings
from internals.image_downloader import downloader
from internals.text_analyzer import adDetector
from models.exception.custom_exception import CustomException


class ImageAdDetection:
    def __init__(self):
        self.user_agent = settings.user_agent
        self.headers = {'User-Agent': self.user_agent}

    def determine_ad_imageURLs(self, image_paths):
        for image_path in image_paths:
            try:
                texts = self._read_text_from_image(image_path)
                if texts is not None:
                    flag, _ = adDetector.detect_sentence(texts)
                    if flag == 1:
                        return True
            except CustomException:
                pass
        return False

    def _read_text_from_image(self, url):
        response_image = downloader.load_image_from_url(url)
        image = vision.Image(content=response_image)

        client = vision.ImageAnnotatorClient()

        # 요청 넣기
        response = client.text_detection(image=image)
        texts = response.text_annotations

        return texts[0].description.replace("\n", " ") if len(texts) > 0 else None


imageDetector = ImageAdDetection()
