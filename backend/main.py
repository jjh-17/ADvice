import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

import cProfile
import io
import pstats

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

app.include_router(detail)
app.include_router(summary)


@app.middleware("http")
async def cprofile_middleware(request: Request, call_next):
    profiler = cProfile.Profile()
    profiler.enable()  # 프로파일링 시작
    response = await call_next(request)
    profiler.disable()  # 프로파일링 정지
    s = io.StringIO()
    sortby = "cumulative"  # 누적 시간으로 정렬
    ps = pstats.Stats(profiler, stream=s).strip_dirs().sort_stats(sortby)
    ps.print_stats()
    print(s.getvalue())  # 콘솔에 출력
    return response


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


# @app.get("/cafe-crawl")
# def cafe_crawl(url: str):
#     start = time.time()
#     scraper = NaverCafeScrapper()
#     list = scraper.scrape_naver_cafe(url)
#
#     print("요청 시간", time.time() - start)
#     return JSONResponse(
#         content=list,
#     )

# @app.get("/summarize")
# def summarize(url: str):
#     scraper = NaverCafeScrapper()
#     text = scraper.scrape_naver_cafe_text(url)
#     summary = SummaryService()
#     result = summary.summarize(text)
#     return {"urlSummary": result}
