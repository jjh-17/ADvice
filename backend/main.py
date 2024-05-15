from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from models.exception.custom_exception import CustomException
from routers.detail_evaluation import detail
from routers.summary import summary
from services.option_service import OptionService
from models.full_request import FullRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detail, tags=["detail"])
app.include_router(summary, tags=["summary"])


@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message},
    )


@app.get("/")
async def root():
    raise CustomException(status_code=404, message="exception test ok")
    return {"message": "Hello World"}


@app.post("/full-option")
async def full_option(data: FullRequest):
    optionService = OptionService()
    return JSONResponse(
        status_code=200, content=await optionService.option_service(data)
    )
