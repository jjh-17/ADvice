from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.emotion_request import EmotionRequest
from services.emotion_service import EmotionPredictionService

emotion = APIRouter()
emotionService = EmotionPredictionService()


@emotion.post("/emo-cnt")
async def emotion_prediction(data: EmotionRequest):
    return JSONResponse(status_code=200, content=await emotionService.predict_cnt(data))


@emotion.post("/emo-summary")
async def emotion_summarization(data: EmotionRequest):
    return JSONResponse(status_code=200, content=await emotionService.predict_summary(data))