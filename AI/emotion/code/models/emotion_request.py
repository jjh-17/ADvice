from pydantic import BaseModel
from typing import List


class EmotionRequest(BaseModel):
    script: List[str]
