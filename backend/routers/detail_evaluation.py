from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.detail_request import DetailRequest
from services.detail_service import DetailService

detail = APIRouter(prefix="/detail")
detailService = DetailService()


@detail.post("")
async def detail_evaluation(data: DetailRequest):
    return JSONResponse(status_code=200, content=await detailService.evaluate(data))
