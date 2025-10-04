from pydantic import BaseModel, Field
from typing import Optional, List, Union, Tuple


class Module(BaseModel):
    id: str
    type: Optional[str] = None
    dim: List[int] = Field(..., min_items=2, max_items=2, description="[width, height] in meters")
    price: Optional[int] = None
    description: Optional[str] = None

    # Water related
    supplied_water: Optional[int] = None  # kL
    water_usage: Optional[int] = None  # kL
    chilled_water: Optional[int] = None  # kL
    distilled_water: Optional[int] = None  # kL
    fresh_water: Optional[int] = None  # kL

    # Power
    usable_power: Optional[int] = None

    # Compute related
    processing: Optional[int] = None  # TFLOPS
    storage_capacity: Optional[int] = None  # TB
    network_capacity: Optional[int] = None  # Gbps
    internal_network: Optional[int] = None  # the amount going out
    external_network: Optional[int] = None
    data_storage: Optional[int] = None

    # Grid & utility connection
    grid_connection: Optional[int] = None
    water_connection: Optional[int] = None

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "transformer_100",
                "type": "transformer",
                "dim": [40, 40],
                "price": 1000,
                "usable_power": 100,
                "grid_connection": 1,
                "description": "100 kW transformer for datacenter power supply"
            }
        }
