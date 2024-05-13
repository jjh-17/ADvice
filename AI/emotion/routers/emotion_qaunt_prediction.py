import time
from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.emotion_quant_service import EmotionQuantPredictionService

emotionQuant = APIRouter()
emotionService = EmotionQuantPredictionService()


@emotionQuant.post("/emotion-quant")
async def emotion_prediction(data: List[str]):
    start = time.time()
    res = await emotionService.predict_all(data)
    print('양자화: ' + str(time.time() - start))
    return JSONResponse(status_code=200, content=res)
    # return JSONResponse(status_code=200, content=await emotionService.predict_all(data))
