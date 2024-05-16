from pydantic import BaseModel
from typing import List


class DetailRequest(BaseModel):
    prediction: List[int]
    score: List[float]
