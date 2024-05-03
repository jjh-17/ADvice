from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.emotion_request import EmotionRequest
from services.emotion_cnt_service import EmotionCntPredictionService

emotion = APIRouter()
emotionCntService = EmotionCntPredictionService()


@emotion.post("/emo-cnt")
async def emotion_prediction(data: EmotionRequest):
    return JSONResponse(status_code=200, content=await emotionCntService.predict_cnt(data))
