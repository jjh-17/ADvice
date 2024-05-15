from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.detail_request import DetailRequest
from services.ad_detect_service import ad_detect_service

detail = APIRouter(prefix="/detail")


@detail.post(
    "/text-ad",
    summary="텍스트 광고 탐지",
    description="이미지 태그 사이의 첫 번째 텍스트 태그가 문단의 기준\n\n점수가 높을수록 광고",
)
async def detect_text_ad(data: DetailRequest):
    return JSONResponse(
        status_code=200, content=(await ad_detect_service.detect_text_ad(data)).dict()
    )


@detail.post("/image-ad", summary="이미지 광고 탐지")
async def detect_image_ad(data: DetailRequest):
    return JSONResponse(
        status_code=200, content=await ad_detect_service.detect_image_ad(data)
    )


@detail.post(
    "/objective-info",
    summary="객관적인 정보 판단",
    description="이미지 태그 시이의 첫 번째 텍스트 태그가 문단의 기준\n\n 점수가 높을수록 객관적인 정보",
)
async def is_objective_info(data: DetailRequest):
    return JSONResponse(
        status_code=200,
        content=(await ad_detect_service.is_objective_info(data)).dict(),
    )
