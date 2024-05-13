import time
from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.emotion_service import EmotionPredictionService

emotion = APIRouter()
emotionService = EmotionPredictionService()


@emotion.post("/emotion")
async def emotion_prediction(data: List[str]):
    start = time.time()
    res = await emotionService.predict_all(data)
    print('일반: ' + str(time.time() - start))
    return JSONResponse(status_code=200, content=res)
    # return JSONResponse(status_code=200, content=await emotionService.predict_all(data))
