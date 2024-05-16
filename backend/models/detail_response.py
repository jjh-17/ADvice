from pydantic import BaseModel
from typing import List, Any


class Score(BaseModel):
    id: str
    type: str
    score: float


class DetailResponse(BaseModel):
    result: List[Score]
