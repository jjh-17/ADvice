import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from models.exception.custom_exception import CustomException
from routers.detail_evaluation import detail
from services.naver_cafe_scrap import NaverCafeScrapper
from services.summary_service import SummaryService
#from services.text_emotion_prediction import TextEmotionPrediction

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detail)


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


@app.get("/cafe-crawl")
def cafe_crawl(url: str):
    start = time.time()
    scraper = NaverCafeScrapper()
    list = scraper.scrape_naver_cafe(url)

    print("요청 시간", time.time() - start)
    return JSONResponse(
        content=list,
    )

@app.post("/summarize")
def summarize(url: str):
    scraper = NaverCafeScrapper()
    text = scraper.scrape_naver_cafe_text(url)
    summary = SummaryService()
    result = summary.summarize(text)
    return {"urlSummary": result}

# @app.get("/emo-predict")
# def emo_prediction(texts: []):
    # start = time.time()
    # emotion_detector = TextEmotionPrediction()  # 텍스트 감정 분석기 선언
    # result = emotion_detector.predict(texts)
    # print("요청 시간", time.time() - start)
    #
    # return {"result": result}