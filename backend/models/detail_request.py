from pydantic import BaseModel, Field
from typing import List, Optional


class Element(BaseModel):
    type: str
    data: Optional[str] = Field(default=None)
    id: Optional[str] = Field(default=None)


class DetailRequest(BaseModel):
    script: List[Element]
