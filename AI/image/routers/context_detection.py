from typing import List

from fastapi import APIRouter
from starlette.responses import JSONResponse

from services.image_detection_service import imageService

context_detect = APIRouter(prefix="/context-detection")


@context_detect.post("")
async def context_evaluation(path: List[str], text: List[str]):
    return JSONResponse(status_code=200, content=imageService.context_analyze(path, text))
