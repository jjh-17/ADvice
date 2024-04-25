# 개발 환경 관리

## 가상 환경 설정

각 개발 환경 간 Python 패키지를 관리하고, 환경이 뒤섞이지 않기 위해 개발 환경 설정을 추천

### 가상 환경 시작

```bash
python -m venv '가상 환경명'
```

- 가상 환경의 이름은 자유로우나 gitignore는 기본 설정을 따름
    -  무시하는 최상위 경로가 `/.venv`로 설정되어 있음
- 이하 가상 환경 설정이 윈도우 환경에 `/.venv`로 설정되어 있다고 가정하고 진행

### 가상 환경 활성화

``` bash
./.venv/Scripts/activate
```

### 가상 환경 비활성화
```bash
deactivate
```

## 패키지 관리

- 패키지 관리는 별도의 라이브러리를 사용하지 않고, requirements.txt 작성

### 설치

```bash
pip install -r requirements.txt
```

### 업데이트

```bash
pip freeze > requirements.txt
```