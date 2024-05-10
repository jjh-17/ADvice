from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.ad_service import adService

text = APIRouter()


@text.post("/ad-evaluate")
def text_ad_evaluate(data: List[str]):
    return JSONResponse(status_code=200, content=adService.ad_evaluation(data))


@text.post("/ad-evaluate/short")
def text_ad_evaluate(data: List[str], path: List[str]):
    return JSONResponse(status_code=200, content=adService.ad_evaluation_shortcut(data, path))
