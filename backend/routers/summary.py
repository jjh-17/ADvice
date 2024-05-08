from fastapi import APIRouter
from starlette.responses import JSONResponse

from services.summary_service import SummaryService

summary = APIRouter(prefix="/summary")
summary_service = SummaryService()


@summary.get("")
async def emotion_base_summary(url: str):
    return JSONResponse(
        status_code=200, content=await summary_service.get_emotion_base_summary(url)
    )
