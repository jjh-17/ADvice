from pydantic import BaseModel, Field
from typing import List, Optional


class FullRequest(BaseModel):
    urlList: List[str]
    goodOption: Optional[List[int]] = Field(default_factory=list)
    badOption: Optional[List[int]] = Field(default_factory=list)
    keyword: Optional[str] = Field("")
