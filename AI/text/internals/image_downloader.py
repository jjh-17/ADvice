import urllib.request
import urllib.error

from config.config import settings
from models.exception.custom_exception import CustomException


class ImageDownloader:
    def __init__(self):
        self.user_agent = settings.user_agent
        self.headers = {'User-Agent': self.user_agent}

    def load_image_from_url(self, url: str):
        req = urllib.request.Request(url, headers=self.headers)

        try:
            response = urllib.request.urlopen(req)
        except urllib.error.HTTPError:
            raise CustomException(400, "이미지 로드 중 문제가 발생했습니다")

        return response.read()


downloader = ImageDownloader()
