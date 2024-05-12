import requests
import json

from config.config import settings

class TextEvaluation:
    async def ad_evaluate_short(self, data):
        res = requests.post(url=settings.emotion_host + "/emotion", data=json.dumps(data))
        return res.json()