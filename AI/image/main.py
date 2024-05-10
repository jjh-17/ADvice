from fastapi import FastAPI
from starlette.requests import Request
from starlette.responses import JSONResponse

from models.exception.custom_exception import CustomException
from routers.context_detection import context_detect
from routers.filter_detection import filter_detect
from routers.human_detection import human_detect

app = FastAPI()

app.include_router(context_detect)
app.include_router(filter_detect)
app.include_router(human_detect)

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message},
    )


@app.get("/")
async def root():
    raise CustomException(404, "Not Found")
