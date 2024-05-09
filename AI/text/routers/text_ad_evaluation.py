from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.ad_service import adService

text = APIRouter()


@text.post("/ad-evaluate")
def text_ad_evaluate(data: List[str]):
    return JSONResponse(status_code=200, content=adService.predict(data))
