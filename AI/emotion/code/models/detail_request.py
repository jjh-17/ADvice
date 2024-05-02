from pydantic import BaseModel
from typing import List


class DetailRequest(BaseModel):
    script: List[str]
