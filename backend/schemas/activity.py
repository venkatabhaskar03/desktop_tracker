from pydantic import BaseModel, Field


class ActivityIn(BaseModel):
    """
    Payload sent by monitoring agents.
    Short keys (cpu/ram/disk/idle) map to longer DB column names in the service layer.
    """
    hostname: str
    username: str
    cpu:  float = Field(..., ge=0.0, le=100.0)
    ram:  float = Field(..., ge=0.0, le=100.0)
    disk: float = Field(..., ge=0.0, le=100.0)
    idle: float = Field(..., ge=0.0)

    model_config = {"populate_by_name": True}
