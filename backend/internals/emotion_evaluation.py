import requests
import json
import httpx
import asyncio

from config.config import settings


class EmotionEvaluation:
    async def get_emotion(self, data):
        res = requests.post(url=settings.emotion_host + "/emotion", data=json.dumps(data))
        return res.json()
