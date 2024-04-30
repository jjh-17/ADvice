from fastapi import APIRouter

from models.detail_request import DetailRequest
from services.detail_service import DetailService

detail = APIRouter(prefix="/detail")
detailService = DetailService()


@detail.post("")
async def detail_evaluation(data: DetailRequest):
    return await detailService.evaluate_ad(data)
