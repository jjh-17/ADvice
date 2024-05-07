import requests
import json

from services.text_ad_detection import TextAdDetection
from config.config import settings


class DetailEvaluation:
    def __init__(self):
        self.__detector = TextAdDetection()

    async def evaluate_ad(self, data):
        ad_result = self.__detector.predict(data)
        return ad_result

    async def evaluate_emotion_count(self, data):
        res = requests.post(url=settings.emotion_host + "/count", data=json.dumps(data))
        return res.json()
