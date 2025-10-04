from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any, Literal
from datetime import datetime

class Message(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str

class SuccessResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class LegacyModule(BaseModel):
    ID: Optional[str] = None
    Name: str
    Is_Input: int
    Is_Output: int
    Unit: str
    Amount: int

    class Config:
        from_attributes = True

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

class ModuleCreate(BaseModel):
    """Module creation model without required ID"""
    type: str
    dim: List[int] = Field(..., min_items=2, max_items=2, description="[width, height] in meters")
    price: Optional[int] = None
    description: Optional[str] = None

    # Optional fields
    supplied_water: Optional[int] = None
    water_usage: Optional[int] = None
    chilled_water: Optional[int] = None
    distilled_water: Optional[int] = None
    fresh_water: Optional[int] = None
    usable_power: Optional[int] = None
    processing: Optional[int] = None
    storage_capacity: Optional[int] = None
    network_capacity: Optional[int] = None
    internal_network: Optional[int] = None
    external_network: Optional[int] = None
    data_storage: Optional[int] = None
    grid_connection: Optional[int] = None
    water_connection: Optional[int] = None

# Definition for a placed module (module with position and rotation)
class Position(BaseModel):
    x: int
    y: int

class PlacedModule(BaseModel):
    id: str
    module: Module
    position: Position
    rotation: int = Field(..., description="Rotation in degrees (0, 90, 180, 270)")
    datacenter_id: Optional[str] = None

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "placed_transformer_123",
                "module": {
                    "id": "transformer_100",
                    "type": "transformer",
                    "dim": [40, 40],
                    "price": 1000,
                    "usable_power": 100
                },
                "position": {
                    "x": 100,
                    "y": 150
                },
                "rotation": 90,
                "datacenter_id": "datacenter_1"
            }
        }

# Datacenter Style/Specification model
class DatacenterSpec(BaseModel):
    ID: str
    Name: str
    Below_Amount: int
    Above_Amount: int
    Minimize: int
    Maximize: int
    Unconstrained: int
    Unit: str
    Amount: int
    id: Optional[str] = Field(None, alias="_id")

    # Additional fields for modern display
    description: Optional[str] = None
    focus: Optional[str] = None
    dim: Optional[List[int]] = None
    price: Optional[int] = None

    # Resource specifications
    grid_connection: Optional[int] = None
    water_connection: Optional[int] = None
    fresh_water: Optional[int] = None
    distilled_water: Optional[int] = None
    chilled_water: Optional[int] = None
    usable_power: Optional[int] = None
    internal_network: Optional[int] = None
    external_network: Optional[int] = None
    data_storage: Optional[int] = None
    processing: Optional[int] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        schema_extra = {
            "example": {
                "ID": "server_square",
                "Name": "Server Squares",
                "description": "Balanced mid-tier data center with decent processing and storage capabilities.",
                "focus": "server",
                "dim": [1000, 500],
                "price": 1000000,
                "grid_connection": 3,
                "water_connection": 1,
                "data_storage": 1000,
                "processing": 1000
            }
        }

# Datacenter Style model
class DatacenterStyle(BaseModel):
    id: str
    name: str
    description: str
    grid_connection: int
    water_connection: int
    processing: Optional[int] = None
    price: Optional[int] = None
    dim: List[int] = Field(..., min_items=2, max_items=2)
    data_storage: Optional[int] = None
    focus: Literal["processing", "storage", "network", "server"]
    recommended_modules: Optional[List[str]] = None

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "server_square",
                "name": "Server Squares",
                "description": "Balanced mid-tier data center with decent processing and storage capabilities.",
                "grid_connection": 3,
                "water_connection": 1,
                "processing": 1000,
                "price": 1000000,
                "dim": [1000, 500],
                "data_storage": 1000,
                "focus": "server",
                "recommended_modules": ["transformer_1000", "water_supply_500", "network_rack_100"]
            }
        }

# Datacenter model to represent a complete datacenter design
class Datacenter(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    modules: List[PlacedModule] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "datacenter_1",
                "name": "Main Production Datacenter",
                "description": "Our primary production datacenter with high redundancy",
                "modules": [],
                "created_at": "2023-05-03T12:00:00Z",
                "updated_at": "2023-05-03T12:00:00Z"
            }
        }
