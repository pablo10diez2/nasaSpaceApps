from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from bson import ObjectId
from app.models.schemas import Position
from app.repositories.position_repository import PositionRepository
from DB.esquemas.esquema_positions import position_esquema, positions_esquema
from pydantic import BaseModel

router = APIRouter(
    prefix="/positions",  # Using plural and no hyphen for consistency
    tags=["positions"],
    responses={404: {"description": "Not found"}}
)

position_repo = PositionRepository()

# Extended position model with additional fields
class PositionCreate(BaseModel):
    x: int
    y: int
    name: Optional[str] = None
    module_id: Optional[str] = None
    datacenter_id: Optional[str] = None

# Import model
class PositionsImport(BaseModel):
    positions: List[PositionCreate]

# Area query model
class AreaQuery(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int
    datacenter_id: Optional[str] = None

@router.get("/", response_description="Get all positions")
async def get_all_positions():
    """Get all positions"""
    try:
        positions = position_repo.get_all()
        return positions_esquema(positions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving positions: {str(e)}")

@router.get("/datacenter/{datacenter_id}", response_description="Get all positions for a datacenter")
async def get_positions_by_datacenter(datacenter_id: str):
    """Get all positions in a specific datacenter"""
    try:
        positions = position_repo.get_by_datacenter_id(datacenter_id)
        return positions_esquema(positions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving positions: {str(e)}")

@router.get("/module/{module_id}", response_description="Get position for a module")
async def get_position_by_module(module_id: str):
    """Get the position for a specific module"""
    try:
        position = position_repo.get_by_module_id(module_id)
        if not position:
            raise HTTPException(status_code=404, detail=f"No position found for module ID {module_id}")

        return position_esquema(position)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving position: {str(e)}")

@router.post("/area", response_description="Find positions in an area")
async def find_positions_in_area(query: AreaQuery):
    """Find all positions within a rectangular area"""
    try:
        positions = position_repo.find_positions_in_area(
            query.x1, query.y1, query.x2, query.y2, query.datacenter_id
        )
        return positions_esquema(positions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding positions: {str(e)}")

@router.get("/{id}", response_description="Get a position by ID")
async def get_position(id: str):
    """Get a specific position by ID"""
    try:
        position = position_repo.get_by_id(id)
        if not position:
            raise HTTPException(status_code=404, detail=f"Position with ID {id} not found")

        return position_esquema(position)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving position: {str(e)}")

@router.post("/", response_description="Create a new position", status_code=201)
async def create_position(position: PositionCreate):
    """Create a new position"""
    try:
        # Convert the Pydantic model to a dictionary
        position_dict = position.dict()

        # Create the position
        id = position_repo.create(position_dict)
        new_position = position_repo.get_by_id(id)

        return position_esquema(new_position)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating position: {str(e)}")

@router.put("/{id}", response_description="Update a position")
async def update_position(id: str, position: PositionCreate):
    """Update an existing position"""
    try:
        # Check if the position exists
        existing = position_repo.get_by_id(id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Position with ID {id} not found")

        # Convert the Pydantic model to a dictionary
        position_dict = position.dict()

        # Update the position
        result = position_repo.update(id, position_dict)

        # Fetch and return the updated position
        updated = position_repo.get_by_id(id)
        return position_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating position: {str(e)}")

@router.delete("/{id}", response_description="Delete a position")
async def delete_position(id: str):
    """Delete a position"""
    try:
        # Check if the position exists
        existing = position_repo.get_by_id(id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Position with ID {id} not found")

        # Delete the position
        result = position_repo.delete(id)

        return {"message": f"Position {id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting position: {str(e)}")

@router.post("/import", response_description="Import multiple positions", status_code=201)
async def import_positions(import_request: PositionsImport):
    """Import multiple positions at once"""
    try:
        if not import_request.positions:
            raise HTTPException(status_code=400, detail="No positions to import")

        # Convert each position to a dictionary
        positions_to_insert = [pos.dict() for pos in import_request.positions]

        # Insert all positions
        result = position_repo.bulk_create(positions_to_insert)

        return {
            "message": f"Successfully imported {len(result)} positions",
            "imported_count": len(result),
            "ids": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing positions: {str(e)}")
