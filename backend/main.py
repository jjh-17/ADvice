from fastapi import FastAPI, HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from webdriver_manager.chrome import ChromeDriverManager
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

# 이미지와 텍스트 분리
@app.get("/cafe-crawl")
def cafe_crawl(url: str):
    start = time.time()
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)

    driver.get(url)
    time.sleep(1)

    driver.switch_to.frame("cafe_main")
    driver.quit()
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

    end = time.time()
    print("요청시간", end - start)
    return JSONResponse(content=response_data)

@app.get("/cafe-crawl2")
def cafe_crawl2(url: str):
    start = time.time()
    options = webdriver.ChromeOptions()
    options.headless = True
    options.add_argument('--headless')
    options.add_argument('--ignore-ssl-errors=yes')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--no-sandbox')
    options.add_argument('--log-level=3')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-extensions')
    options.add_argument('--incognito')
    options.add_argument('--disable-images')

    # 속도 향상을 위한 옵션 해제
    prefs = {'profile.default_content_setting_values': {'cookies': 2, 'images': 2, 'plugins': 2, 'popups': 2,
                                                        'geolocation': 2, 'notifications': 2,
                                                        'auto_select_certificate': 2, 'fullscreen': 2, 'mouselock': 2,
                                                        'mixed_script': 2, 'media_stream': 2, 'media_stream_mic': 2,
                                                        'media_stream_camera': 2, 'protocol_handlers': 2,
                                                        'ppapi_broker': 2, 'automatic_downloads': 2, 'midi_sysex': 2,
                                                        'push_messaging': 2, 'ssl_cert_decisions': 2,
                                                        'metro_switch_to_desktop': 2, 'protected_media_identifier': 2,
                                                        'app_banner': 2, 'site_engagement': 2, 'durable_storage': 2}}
    options.add_experimental_option('prefs', prefs)

    options.add_argument('--blink-settings=imagesEnabled=false')
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    options.add_argument(f'user-agent={user_agent}')

    caps = DesiredCapabilities.CHROME
    caps["pageLoadStrategy"] = "none"

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    # driver = webdriver.Chrome()
    driver.get(url)

    time.sleep(1)
    # driver.implicitly_wait(3)

    driver.switch_to.frame("cafe_main")
    soup = BeautifulSoup(driver.page_source, "html.parser")

    data = soup.select('.se-main-container > div')
    list = []
    key = 1

    for i in range(len(data)):
        cur = data[i]
        if(cur['class'][1] == 'se-text'):
            # 전체
            # cur_list.append(key)
            # cur_list.append("text")
            # cur_list.append(cur.div.div.div.text.strip())
            # list.append(cur_list)
            span_text_list = cur.select("span")
            for j in range(len(span_text_list)):
                span_text = span_text_list[j]
                cur_list = []
                cur_list.append(key)
                cur_list.append("text")
                cur_list.append(span_text.get_text())
                key += 1
                list.append(cur_list)
        if (cur['class'][1] == 'se-image'):
            cur_list = []
            cur_list.append(key)
            cur_list.append("image")
            cur_list.append(cur.div.div.div.a.img['src'])
            list.append(cur_list)
            key += 1

    response_data = {
        "url": url,
        "list": list
    }

    print("요청시간", time.time() - start)
    return JSONResponse(content=response_data)