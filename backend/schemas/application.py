from pydantic import BaseModel, Field
from typing import List


class AppEntry(BaseModel):
    name:   str
    cpu:    float = Field(..., ge=0.0)
    memory: float = Field(..., ge=0.0)


class ApplicationsIn(BaseModel):
    hostname: str
    username: str
    apps:     List[AppEntry]
