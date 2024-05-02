from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.detail_request import DetailRequest
from services.emotion_service import EmotionPredictionService


emotion = APIRouter(prefix="/emo-predict")
emotionService = EmotionPredictionService()


@emotion.post("")
async def emotion_prediction(data: DetailRequest):
    return JSONResponse(status_code=200, content=await emotionService.predict(data))
