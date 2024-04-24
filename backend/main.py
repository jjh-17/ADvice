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
def cafe_crawl(url: str):
    # options = webdriver.ChromeOptions()
    # options.add_argument(
    #     'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    # )
    # driver = webdriver.Chrome(options=options)
    driver = webdriver.Chrome()
    driver.get(url)
    time.sleep(1)

    driver.switch_to.frame("cafe_main")
    soup = BeautifulSoup(driver.page_source, "html.parser")

    #print(soup.select('.se-main-container'))
    # data = soup.select('.se-main-container > div')
    texts = soup.select('.se-main-container > div > div > div > div > p > span')
    textList = []
    key = 1
    for t in texts:
        #print(t.text)
        list = []
        list.append(key)
        list.append(t.text)
        textList.append(list)
        key+=1

    imgList = []
    key = 1
    imgs = soup.select('.se-main-container > div > div > div > div > a > img.se-image-resource')
    for img in imgs:
        #print(img.get('src'))
        list = []
        list.append(key)
        list.append(img.get('src'))
        imgList.append(list)
        key+=1

    response_data = {
        "url": url,
        "textList": textList,
        "imgList": imgList
    }

    return JSONResponse(content=response_data)