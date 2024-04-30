from pydantic import BaseModel
from typing import List


class Element(BaseModel):
    type: str
    data: str
    id: str


class DetailRequest(BaseModel):
    script: List[Element]
