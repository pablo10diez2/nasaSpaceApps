from pydantic import BaseModel
class DataCenterSpec(BaseModel):
    ID: int
    Name: str
    Below_Amount: int
    Above_Amount: int
    Minimize: int
    Maximize: int
    Unconstrained: int
    Unit: str
    Amount: int