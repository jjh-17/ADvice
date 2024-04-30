import os
from google.cloud import vision
import urllib.request
import urllib.error

from backend.models.exception.custom_exception import CustomException
from backend.services.text_ad_detection import TextAdDetection

class ImageAdDetection:
    def __init__(self):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './model/OCR/sound-catalyst-421203-3bf1190b292d.json'
        self.client = vision.ImageAnnotatorClient()
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
        self.headers = {'User-Agent': self.user_agent}

    def determine_ad_imageURLs(self, image_paths):
        detector = TextAdDetection()
        for image_path in image_paths:
            texts = self.read_text_from_image(image_path)
            if texts != "no image":
                flag = detector.sentence_predict(texts)
                if flag > 0:
                    return True
        return False

    def read_text_from_image(self, url):
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

        return ' '.join(texts[0].description.split('\n')) if len(texts) > 0 else "no image"