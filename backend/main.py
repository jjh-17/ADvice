import time

from fastapi import FastAPI, HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse

from models.exception.custom_exception import CustomException

from services.naver_cafe_scrap import NaverCafeScrapper

app = FastAPI()


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

    print("요청 시간", time.time()-start)
    return JSONResponse(
        content=list,
    )