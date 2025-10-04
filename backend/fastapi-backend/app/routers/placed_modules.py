from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from bson import ObjectId
from app.models.schemas import PlacedModule, Module, Position
from app.repositories.placed_module_repository import PlacedModuleRepository
from app.repositories.module_repository import ModuleRepository
from DB.esquemas.esquema_placed_modules import placed_module_esquema, placed_modules_esquema
from pydantic import BaseModel

router = APIRouter(
    prefix="/placed-modules",
    tags=["placed_modules"],
    responses={404: {"description": "Not found"}}
)

placed_module_repo = PlacedModuleRepository()
module_repo = ModuleRepository()

# Import models
class PlacedModuleImport(BaseModel):
    placed_modules: List[PlacedModule]

class PlacedModuleUpdatePosition(BaseModel):
    position: Position
    rotation: Optional[int] = None

@router.get("/", response_description="Get all placed modules")
async def get_all_placed_modules():
    """Get all placed modules across all datacenters"""
    try:
        placed_modules = placed_module_repo.get_all()
        return placed_modules_esquema(placed_modules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving placed modules: {str(e)}")

@router.get("/datacenter/{datacenter_id}", response_description="Get all placed modules for a datacenter")
async def get_placed_modules_by_datacenter(datacenter_id: str):
    """Get all modules placed in a specific datacenter"""
    try:
        placed_modules = placed_module_repo.get_by_datacenter_id(datacenter_id)
        return placed_modules_esquema(placed_modules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving placed modules: {str(e)}")

@router.get("/{id}", response_description="Get a placed module by ID")
async def get_placed_module(id: str):
    """Get a specific placed module by ID"""
    try:
        placed_module = placed_module_repo.get_by_id(id)
        if not placed_module:
            raise HTTPException(status_code=404, detail=f"Placed module with ID {id} not found")

        return placed_module_esquema(placed_module)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving placed module: {str(e)}")

@router.post("/", response_description="Create a new placed module", status_code=201)
async def create_placed_module(placed_module: PlacedModule):
    """Create a new placed module"""
    try:
        # Validate that the module exists
        if not placed_module.module or not placed_module.module.id:
            raise HTTPException(status_code=400, detail="Module reference is required")

        # Convert the Pydantic model to a dictionary
        placed_module_dict = placed_module.dict()

        # Create the placed module
        id = placed_module_repo.create(placed_module_dict)
        new_placed_module = placed_module_repo.get_by_id(id)

        return placed_module_esquema(new_placed_module)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating placed module: {str(e)}")

@router.put("/{id}", response_description="Update a placed module")
async def update_placed_module(id: str, placed_module: PlacedModule):
    """Update an existing placed module"""
    try:
        # Check if the placed module exists
        existing = placed_module_repo.get_by_id(id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Placed module with ID {id} not found")

        # Convert the Pydantic model to a dictionary and exclude id
        placed_module_dict = placed_module.dict(exclude={"id"})

        # Update the placed module
        result = placed_module_repo.update(id, placed_module_dict)

        # Fetch and return the updated module
        updated = placed_module_repo.get_by_id(id)
        return placed_module_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating placed module: {str(e)}")

@router.patch("/{id}/position", response_description="Update a placed module's position")
async def update_placed_module_position(id: str, update_data: PlacedModuleUpdatePosition):
    """Update just the position and rotation of a placed module"""
    try:
        # Check if the placed module exists
        existing = placed_module_repo.get_by_id(id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Placed module with ID {id} not found")

        # Create update dict
        update_dict = {"position": update_data.position.dict()}
        if update_data.rotation is not None:
            update_dict["rotation"] = update_data.rotation

        # Update the position
        result = placed_module_repo.update(id, update_dict)

        # Fetch and return the updated module
        updated = placed_module_repo.get_by_id(id)
        return placed_module_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating placed module position: {str(e)}")

@router.delete("/{id}", response_description="Delete a placed module")
async def delete_placed_module(id: str):
    """Delete a placed module"""
    try:
        # Check if the placed module exists
        existing = placed_module_repo.get_by_id(id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Placed module with ID {id} not found")

        # Delete the placed module
        result = placed_module_repo.delete(id)

        return {"message": f"Placed module {id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting placed module: {str(e)}")

@router.post("/import", response_description="Import multiple placed modules", status_code=201)
async def import_placed_modules(import_request: PlacedModuleImport):
    """Import multiple placed modules at once"""
    try:
        if not import_request.placed_modules:
            raise HTTPException(status_code=400, detail="No placed modules to import")

        # Convert each placed module to a dictionary
        placed_modules_to_insert = [pm.dict() for pm in import_request.placed_modules]

        # Insert all placed modules
        result = placed_module_repo.bulk_create(placed_modules_to_insert)

        return {
            "message": f"Successfully imported {len(result)} placed modules",
            "imported_count": len(result),
            "ids": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing placed modules: {str(e)}")

@router.delete("/datacenter/{datacenter_id}", response_description="Delete all placed modules for a datacenter")
async def delete_placed_modules_by_datacenter(datacenter_id: str, confirm: bool = Query(False)):
    """Delete all placed modules for a specific datacenter"""
    try:
        if not confirm:
            raise HTTPException(
                status_code=400,
                detail="Confirmation required. Add '?confirm=true' to confirm deletion."
            )

        deleted_count = placed_module_repo.delete_by_datacenter_id(datacenter_id)

        return {
            "message": f"Successfully deleted {deleted_count} placed modules from datacenter {datacenter_id}",
            "deleted_count": deleted_count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting placed modules: {str(e)}")
