from google.cloud import vision
import urllib.request
import urllib.error

from config.config import settings
from internals.text_ad_detection import textDetector
from models.exception.custom_exception import CustomException


class ImageAdDetection:
    def __init__(self):
        self.user_agent = settings.user_agent
        self.headers = {'User-Agent': self.user_agent}

    def determine_ad_imageURLs(self, image_paths):
        for image_path in image_paths:
            texts = self._read_text_from_image(image_path)
            if texts is not None:
                flag = textDetector.sentence_predict(texts)
                if flag > 0:
                    return True
        return False

    def _read_text_from_image(self, url):
        req = urllib.request.Request(url, headers=self.headers)

        try:
            response = urllib.request.urlopen(req)
        except urllib.error.HTTPError:
            raise CustomException(400, "이미지 로드 중 문제가 발생했습니다")

        response_image = response.read()
        image = vision.Image(content=response_image)

        client = vision.ImageAnnotatorClient()

        # 요청 넣기
        response = client.text_detection(image=image)
        texts = response.text_annotations

        return texts[0].description.replace("\n", " ") if len(texts) > 0 else None


imageDetector = ImageAdDetection()
