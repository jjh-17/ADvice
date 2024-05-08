import requests
import json

from config.config import settings


class EmotionEvaluation:
    async def get_emotion_count(self, data):
        res = requests.post(url=settings.emotion_host + "/count", data=json.dumps(data))
        return res.json()
