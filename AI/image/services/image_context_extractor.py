import os
from google.cloud import vision

from services.image_downloader import downloader


class ImageAdDetection:
    def __init__(self):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './model/OCR/sound-catalyst-421203-3bf1190b292d.json'
        self.client = vision.ImageAnnotatorClient()

    def extract_label_from_image(self, url: str) -> list:
        response_image = downloader.load_image_from_url(url)
        image = vision.Image(content=response_image)

        # 요청 넣기
        response = self.client.label_detection(image=image)
        annotations = response.label_annotations

        return list(map(lambda label: label.description, annotations))
