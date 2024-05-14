from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from models.exception.custom_exception import CustomException
from services.ad_service import adService

text = APIRouter()


@text.post("/ad-evaluate")
def text_ad_evaluate(data: List[str]):
    if not data:
        raise CustomException(422, "No texts provided")
    return JSONResponse(status_code=200, content=adService.ad_evaluation(data))


@text.post("/ad-evaluate/short")
def text_ad_evaluate(data: List[str], path: List[str]):
    if not data:
        raise CustomException(422, "No texts provided")
    return JSONResponse(status_code=200, content=adService.ad_evaluation_shortcut(data, path))
