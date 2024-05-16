from pydantic import BaseModel
from typing import List, Any


class Type(BaseModel):
    id: str
    type: str


class Score(BaseModel):
    id: str
    score: float


class TypeResponse(BaseModel):
    result: List[Type]


class ScoreResponse(BaseModel):
    result: List[Score]
