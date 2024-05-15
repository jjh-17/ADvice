from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.emotion_service import EmotionPredictionService

emotion = APIRouter()
emotionService = EmotionPredictionService()


@emotion.post("/emotion")
async def emotion_prediction(data: List[str]):
    return JSONResponse(status_code=200, content=await emotionService.predict_all(data))


@emotion.post("/emotions")
async def emotions_prediction(data: List[str]):
    return JSONResponse(status_code=200, content=await emotionService.predicts_all(data))
