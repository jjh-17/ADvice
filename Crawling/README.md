# 24. 04. 18

# 이인석
## Scrapy with BeautifulSoup

- 코드
    
    ```sql
    import scrapy
    from bs4 import BeautifulSoup
    
    class MySpider(scrapy.Spider):
        name = 'example'
    
        start_urls = [
            'http://example.com/page1',
            'http://example.com/page2',
        ]
    
        def parse(self, response):
            # Scrapy로부터 받은 응답(response)에서 HTML 추출
            html_content = response.body
    
            # BeautifulSoup을 사용하여 HTML 파싱
            soup = BeautifulSoup(html_content, 'html.parser')
    
            # 원하는 데이터 추출
            titles = soup.find_all('h1')
            for title in titles:
                yield {
                    'title': title.get_text()
                }
    ```
    
- Scrapy의 spider에 BeautifulSoup로 문서의 구문 파싱을 진행하도록 설정
- BeautifulSoup로 하지 못하는 페이지 Download는 Scrapy를 통해 흐름을 진행


## 네이버 검색 페이지

- 검색 결과 내 하나의 블럭
    - class : sc_new, _*slog_visual*



- 검색 결과 url text
    - fds-ugc-block-mod-list
        
        > fds-ugc-block-mod
        
        > fds-ugc-body
        
        > fds-comps-right-image-content-container
        
        > fds-comps-right-image-text-container
        
        > fds-comps-right-image-text-title
        
    - 위 클래스 경로를 통해 a 태그로 이어짐
- 하단 스크립트 태그
    
    [Script.html](https://prod-files-secure.s3.us-west-2.amazonaws.com/6d5bed8f-ebf3-4ada-b901-fc60fee8319e/908aab4b-c55e-4cae-a360-27ef3d1c55a1/Script.html)
    
    - 블로그, 카페 글은 `fds-comps-right-image-text-title` 클래스에 들어감


# 24. 04. 19

# 이인석
## 티스토리

- 개인이 HTML과 CSS 수정 가능
    - p, span, div와 같이 내부에 Text가 있는 태그에 대해 수집하여 진행?
    - 각 티스토리별로 본문의 클래스나 id가 달라 정형화되어있지 않음
- 우선적으로 네이버 블로그와 카페를 대상으로 프로세스 실행

## 기타 사이트

- [식신,](https://www.siksinhot.com/) [다이닝 코드](https://www.diningcode.com/), [데이트곰](https://dategom.com/) 등등
- 존재하긴 하나 이에 대해 AI 입력이 가능할지 미지수
- 정형화되었지만 다른 플랫폼으로 확장성을 고려하고 배제?

# 24. 04. 19

# 이인석
## Fast API

WSGI

- Python 애플리케이션, 스크립트가 웹 서버와 통신하기 위한 인터페이스로써 CGI 디자인 패턴을 모태로 하여 만들어진 것이지만 실제 CGI와는 다소 차이가 있음
- CGI의 가장 큰 단점은 요청이 들어올 때마다 새로운 프로세스를 생성한다는 점인데, 이런 단점을 보완하기 위해서 고안된 개념

ASGI  

- WSGI만으로도 우리는 충분히 클라이언트의 요청을 웹 서버가 받아 내 애플리케이션으로 올 수 있도록 구성할 수 있었음
- 하지만 공교롭게도 이것만으로는 현대 웹 서비스의 대용량 트래픽 처리를 유연하게 하기 위한 만족된 조건을 충족하기 어려운 점이 있음
- 이에 비동기로 동작하도록 등장한 것이 ASGI

