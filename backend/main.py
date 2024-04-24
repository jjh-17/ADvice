from fastapi import FastAPI, HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse
from selenium import webdriver
import time
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
    # options = webdriver.ChromeOptions()
    # options.add_argument(
    #     'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    # )
    # driver = webdriver.Chrome(options=options)
    driver = webdriver.Chrome()
    url = 'https://cafe.naver.com/zzop/2306213?art=ZXh0ZXJuYWwtc2VydmljZS1uYXZlci1zZWFyY2gtaW50ZW50LXZpZXc=.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYWZlVHlwZSI6IkNBRkVfVVJMIiwiY2FmZVVybCI6Inp6b3AiLCJhcnRpY2xlSWQiOjIzMDYyMTMsImlzc3VlZEF0IjoxNzEzOTIyODUzOTM1fQ.88I1lv4mO6sUpYXDGeREfviVNjBCDGpJZkkL3odfcyo'
    driver.get(url)
    time.sleep(1)

    driver.switch_to.frame("cafe_main")
    soup = BeautifulSoup(driver.page_source, "html.parser")

    #print(soup.select('.se-main-container'))
    # data = soup.select('.se-main-container > div')
    key = 1
    texts = soup.select('.se-main-container > div > div > div > div > p > span')
    for t in texts:
        {key : t.text}
        print(key, t.text)
        key+=1

    key = 1
    imgs = soup.select('.se-main-container > div > div > div > div > a > img.se-image-resource')
    for img in imgs:
        {key: img.get('src')}
        print(key, img.get('src'))
        key += 1