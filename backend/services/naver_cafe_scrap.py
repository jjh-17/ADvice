from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from webdriver_manager.chrome import ChromeDriverManager
import time
from kss import split_sentences
from bs4 import BeautifulSoup
import os


class NaverCafeScrapper:
    def __init__(self):
        self.driver = None

    def create_webdriver(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_experimental_option("detach", True)
        #
        # # 속도 향상을 위한 옵션 해제
        # prefs = {'profile.default_content_setting_values': {'cookies': 2, 'images': 2, 'plugins': 2, 'popups': 2,
        #                                                     'geolocation': 2, 'notifications': 2,
        #                                                     'auto_select_certificate': 2, 'fullscreen': 2,
        #                                                     'mouselock': 2,
        #                                                     'mixed_script': 2, 'media_stream': 2, 'media_stream_mic': 2,
        #                                                     'media_stream_camera': 2, 'protocol_handlers': 2,
        #                                                     'ppapi_broker': 2, 'automatic_downloads': 2,
        #                                                     'midi_sysex': 2,
        #                                                     'push_messaging': 2, 'ssl_cert_decisions': 2,
        #                                                     'metro_switch_to_desktop': 2,
        #                                                     'protected_media_identifier': 2,
        #                                                     'app_banner': 2, 'site_engagement': 2,
        #                                                     'durable_storage': 2}}
        # options.add_experimental_option('prefs', prefs)
        #
        # options.add_argument('--blink-settings=imagesEnabled=false')
        # user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        # options.add_argument(f'user-agent={user_agent}')
        #
        # caps = DesiredCapabilities.CHROME
        # caps["pageLoadStrategy"] = "none"
        print(os.getcwd())
        # ChromeDriver 경로 지정 및 옵션 설정
        driver_path = "/usr/local/bin/chromedriver"
        service = Service(executable_path=driver_path)

        # 웹드라이버 초기화
        driver = webdriver.Chrome(service=service, options=options)
        # driver = webdriver.Chrome(service=Service(ChromeDriverManager(driver_version='124.0.6367.91').install()), options=options)
        # driver = webdriver.Chrome(options=options)
        return driver

    def initialize_driver(self):
        self.driver = self.create_webdriver()

    def close_driver(self):
        if self.driver:
            self.driver.quit()
            self.driver = None

    def scrape_naver_cafe_text(self, soup):
        texts = soup.select(".se-main-container > div > div > div > div > p > span")

        result = ""
        for t in texts:
            result = result + t.text
        return result

    def scrape_naver_cafe_init(self, url: str):
        self.initialize_driver()
        self.driver.get(url)
        time.sleep(1)
        self.driver.switch_to.frame("cafe_main")
        soup = BeautifulSoup(self.driver.page_source, "html.parser")
        self.close_driver()
        return soup

    def scrape_naver_cafe(self, url: str):
        self.initialize_driver()
        self.driver.get(url)
        time.sleep(1)
        # driver.implicitly_wait(3)

        self.driver.switch_to.frame("cafe_main")
        self.close_driver()
        soup = BeautifulSoup(self.driver.page_source, "html.parser")

        data = soup.select(".se-main-container > div")
        result_list = []
        key = 1

        for i in range(len(data)):
            cur = data[i]
            if cur["class"][1] == "se-text":
                # 전체
                # cur_list.append(key)
                # cur_list.append("text")
                # cur_list.append(cur.div.div.div.text.strip())
                # list.append(cur_list)

                result = self.paragraph_ad(cur.div.div.div.text.strip())

                span_text_list = cur.select("span")
                for j in range(len(span_text_list)):
                    span_text = span_text_list[j]
                    cur_list = []
                    cur_list.append(key)
                    cur_list.append("text")
                    # cur_list.append(span_text.get_text())
                    list = self.split_string(span_text.get_text())
                    ad_string = ""
                    for k in range(len(list)):
                        if list[k] in result:
                            ad_string = ad_string + list[k]
                    cur_list.append(ad_string)
                    key += 1
                    result_list.append(cur_list)
            if cur["class"][1] == "se-image":
                cur_list = []
                cur_list.append(key)
                cur_list.append("image")
                cur_list.append(cur.div.div.div.a.img["src"])
                result_list.append(cur_list)
                key += 1

        return result_list

    def paragraph_ad(self, paragraph: str):
        return []

    def split_string(self, paragraph: str):
        list = split_sentences(paragraph)
        return list
