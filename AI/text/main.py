from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.text_ad_evaluation import text
from routers.text_info_evaluation import info

#TODO: 프로파일링 완료 후 삭제 요망
import cProfile
import io
import pstats

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#TODO: 프로파일링 완료 후 삭제 요망
@app.middleware("http")
async def cprofile_middleware(request, call_next):
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


app.include_router(text)
app.include_router(info)
