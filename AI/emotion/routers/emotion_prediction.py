from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.emotion_service import EmotionPredictionService

emotion = APIRouter()
emotionService = EmotionPredictionService()


@emotion.post("/count")
async def emotion_prediction(data: List[str]):
    return JSONResponse(status_code=200, content=await emotionService.predict_cnt(data))


@emotion.post("/summary")
async def emotion_summarization(data: List[str]):
    return JSONResponse(status_code=200, content=await emotionService.predict_summary(data))