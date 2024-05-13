import os
from google.cloud import vision

from internals.image_downloader import downloader


class ImageContextExtractor:
    def extract_label_from_image(self, url: str) -> list:
        response_image = downloader.load_image_from_url(url)
        image = vision.Image(content=response_image)

        client = vision.ImageAnnotatorClient()
        # 요청 넣기
        response = client.label_detection(image=image)
        annotations = response.label_annotations

        return list(map(lambda label: label.description, annotations))


contextExtractor = ImageContextExtractor()
