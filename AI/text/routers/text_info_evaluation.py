from fastapi import APIRouter
from typing import List
from starlette.responses import JSONResponse

from services.info_service import infoService

info = APIRouter()


@info.post("/info-evaluate")
def text_ad_evaluate(data: List[str]):
    return JSONResponse(status_code=200, content=infoService.detail_info_detection(data))
