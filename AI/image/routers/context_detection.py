from typing import List

from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.exception.custom_exception import CustomException
from services.image_detection_service import imageService

context_detect = APIRouter(prefix="/context-detection")


@context_detect.post("")
async def context_evaluation(path: List[str], text: List[str]):
    if not text:
        raise CustomException(422, "text is empty")
    elif not path:
        raise CustomException(422, "image_path is empty")
    return JSONResponse(status_code=200, content=imageService.context_analyze(path, text))
