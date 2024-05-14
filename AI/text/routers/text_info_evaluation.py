from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from models.exception.custom_exception import CustomException
from services.info_service import infoService

info = APIRouter()


@info.post("/info-evaluate")
def text_ad_evaluate(data: List[str]):
    if not data:
        raise CustomException(422, "No texts provided")
    return JSONResponse(status_code=200, content=infoService.detail_info_detection(data))
