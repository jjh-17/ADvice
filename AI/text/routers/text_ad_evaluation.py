from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.text_ad_detection import TextAdDetection

text = APIRouter()
textAdService = TextAdDetection()


@text.post("/ad-evaluate")
def text_ad_evaluate(data: List[str]):
    return JSONResponse(status_code=200, content=textAdService.predict(data))