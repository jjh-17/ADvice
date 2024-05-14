from json import JSONDecodeError
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from starlette.requests import Request

from models.exception.custom_exception import CustomException
from routers.emotion_prediction import emotion


# app 설정
app = FastAPI()

#
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 추가
app.include_router(emotion)


# Excepton 핸들러 추가
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    try:
        body = await request.json()
    except JSONDecodeError:
        body = "No valid JSON provided"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": exc.message,
            "requests": {
                "host": request.client.host,
                "query_params": dict(request.query_params),
                "body": body
            }
        },
    )


@app.get("/")
def show_err(url: str):
    raise CustomException(400, "에러 테스트")