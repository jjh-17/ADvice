from pydantic import BaseModel
from typing import List

class FullRequest(BaseModel):
    urlList: List[str]
    goodOption: List[int]
    badOption: List[int]
    keyword: str