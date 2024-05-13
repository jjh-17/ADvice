from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.detail_request import DetailRequest
from services.ad_detect_service import ad_detect_service

detail = APIRouter(prefix="/detail")


@detail.post("/text-ad")
async def detect_text_ad(data: DetailRequest):
    return JSONResponse(
        status_code=200, content=await ad_detect_service.detect_text_ad(data)
    )


@detail.post("/image-ad")
async def detect_image_ad(data: DetailRequest):
    return JSONResponse(
        status_code=200, content=await ad_detect_service.detect_image_ad(data)
    )


@detail.post("/objective-info")
async def is_objective_info(data: DetailRequest):
    return JSONResponse(
        status_code=200, content=await ad_detect_service.is_objective_info(data)
    )
