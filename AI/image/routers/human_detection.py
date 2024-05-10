from typing import List

from fastapi import APIRouter
from starlette.responses import JSONResponse

from services.image_detection_service import imageService

human_detect = APIRouter(prefix="/human-detection")


@human_detect.post("")
async def human_evaluation(data: List[str]):
    return JSONResponse(status_code=200, content=imageService.human_detection(data))
