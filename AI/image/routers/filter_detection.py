from typing import List

from fastapi import APIRouter
from starlette.responses import JSONResponse

from services.image_detection_service import imageService

filter_detect = APIRouter(prefix="/filter-detection")


@filter_detect.post("")
async def filter_evaluation(data: List[str]):
    return JSONResponse(status_code=200, content=imageService.filter_detection(data))
