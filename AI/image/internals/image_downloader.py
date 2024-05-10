from typing import Tuple

import cv2
import urllib.request
import urllib.error
import numpy as np
from PIL import Image
from io import BytesIO

from models.exception.custom_exception import CustomException


class ImageDownloader:
    def load_image_from_url(self, url: str):
        return self._download_image(url)

    def load_matrix_from_url(self, url: str) -> np.ndarray:
        res = self._download_image(url)
        image = np.asarray(bytearray(res), dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_GRAYSCALE)
        return image

    def _download_image(self, url: str):
        try:
            response = urllib.request.urlopen(url)
        except urllib.error.HTTPError:
            raise CustomException(400, "이미지 로드 중 문제가 발생했습니다")
        return response.read()

    def _get_image_resolution(self, image: np.ndarray) -> Tuple[int, int]:
        image = Image.open(BytesIO(image))
        width, height = image.size
        return width, height


downloader = ImageDownloader()
