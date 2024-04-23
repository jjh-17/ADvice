from fastapi import FastAPI, HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse
from selenium import webdriver
from bs4 import BeautifulSoup

from models.exception.CustomException import CustomException

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
def cafe_crawl():
    driver = webdriver.Chrome()
    url = 'https://cafe.naver.com/cosmania/14985050?art=ZXh0ZXJuYWwtc2VydmljZS1uYXZlci1zZWFyY2gtY2FmZS1wcg.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYWZlVHlwZSI6IkNBRkVfVVJMIiwiY2FmZVVybCI6ImNvc21hbmlhIiwiYXJ0aWNsZUlkIjoxNDk4NTA1MCwiaXNzdWVkQXQiOjE3MTM4NTU3NzQ0ODN9.qFUhsgkWPb4COj8SgJBTOGtIgFc4nq15B-1QEPiBf4E'
    driver.get(url)

    driver.switch_to.frame("cafe_main")
    soup = BeautifulSoup(driver.page_source, "html.parser")