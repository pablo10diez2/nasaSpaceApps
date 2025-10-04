from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from bson import ObjectId
from app.models.schemas import Datacenter, PlacedModule, Position
from app.repositories.datacenter_repository import DatacenterRepository
from app.repositories.placed_module_repository import PlacedModuleRepository
from app.repositories.module_repository import ModuleRepository
from app.repositories.datacenter_style_repository import DatacenterStyleRepository
from DB.esquemas.esquema_datacenters import datacenter_esquema, datacenters_esquema, datacenter_esquema_minimal, datacenters_esquema_minimal
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/datacenters",
    tags=["datacenters"],
    responses={404: {"description": "Not found"}}
)

datacenter_repo = DatacenterRepository()
placed_module_repo = PlacedModuleRepository()
module_repo = ModuleRepository()
style_repo = DatacenterStyleRepository()

# Request models
class DatacenterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    style_id: Optional[str] = None
    dim: Optional[List[int]] = None
    grid_connection: Optional[int] = None
    water_connection: Optional[int] = None

class DatacenterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    style_id: Optional[str] = None
    dim: Optional[List[int]] = None
    grid_connection: Optional[int] = None
    water_connection: Optional[int] = None

class DatacenterSearch(BaseModel):
    query: str
    limit: int = 10

# New request models for the simplified format
class ModulePosition(BaseModel):
    id: str  # ID of the module (not placed module)
    position: Position
    rotation: int = 0

class DatacenterCreateSimple(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    styleId: str  # Style ID to use as base for datacenter
    modules: List[ModulePosition] = []

@router.get("/", response_description="List all datacenters")
async def list_datacenters(include_modules: bool = False, minimal: bool = True, limit: int = 100, skip: int = 0):
    """
    Get all datacenters with pagination.

    - **include_modules**: Whether to include placed modules in the response
    - **minimal**: Return only essential datacenter information
    - **limit**: Maximum number of datacenters to return
    - **skip**: Number of datacenters to skip
    """
    try:
        datacenters = datacenter_repo.get_all(include_modules if not minimal else False)

        # Apply pagination
        paginated = datacenters[skip:skip + limit]

        if minimal:
            return {
                "total": len(datacenters),
                "datacenters": datacenters_esquema_minimal(paginated)
            }
        else:
            return {
                "total": len(datacenters),
                "datacenters": datacenters_esquema(paginated)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenters: {str(e)}")

@router.post("/search", response_description="Search datacenters")
async def search_datacenters(search: DatacenterSearch):
    """
    Search datacenters by name or description
    """
    try:
        results = datacenter_repo.search(search.query, search.limit)
        return datacenters_esquema(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching datacenters: {str(e)}")

@router.get("/{id}", response_description="Get a datacenter by ID")
async def get_datacenter(id: str, include_modules: bool = True):
    """
    Get a specific datacenter by ID

    - **include_modules**: Whether to include placed modules in the response
    """
    try:
        datacenter = datacenter_repo.get_by_id(id, include_modules)
        if not datacenter:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        return datacenter_esquema(datacenter)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenter: {str(e)}")

@router.get("/minimal/{id}", response_description="Get a datacenter by ID")
async def get_datacenter(id: str, include_modules: bool = True):
    try:
        datacenter = datacenter_repo.get_by_id(id, include_modules)
        if not datacenter:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        modules_list = []
        if include_modules and "modules" in datacenter:
            for module in datacenter.get("modules", []):
                module_id = module.get("module_id") or (module.get("module", {}) or {}).get("id")
                if not module_id:
                    continue

                modules_list.append({
                    "id": module_id,
                    "position": module.get("position", {}),
                    "rotation": module.get("rotation", 0)
                })

        # Create response in requested format
        response = {
            "styleId": datacenter.get("style_id", ""),
            "modules": modules_list
        }

        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenter: {str(e)}")

@router.get("/{id}/simple", response_description="Get a simplified datacenter view")
async def get_datacenter_simple(id: str):
    """
    Get a datacenter with its modules in the simplified format

    Returns the datacenter with its style ID and a list of module positions
    """
    try:
        datacenter = datacenter_repo.get_by_id(id, include_modules=True)
        if not datacenter:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Transform to the simplified format
        simple_modules = []
        for module in datacenter.get("modules", []):
            module_id = module.get("module_id") or (module.get("module", {}) or {}).get("id")
            if not module_id:
                continue

            simple_modules.append({
                "id": module_id,
                "position": module.get("position", {}),
                "rotation": module.get("rotation", 0)
            })

        simple_datacenter = {
            "id": str(datacenter.get("_id")) if "_id" in datacenter else datacenter.get("id", ""),
            "name": datacenter.get("name", ""),
            "description": datacenter.get("description", ""),
            "styleId": datacenter.get("style_id", ""),
            "modules": simple_modules,
            "created_at": datacenter.get("created_at"),
            "updated_at": datacenter.get("updated_at")
        }

        return {
            "datacenter": simple_datacenter
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenter: {str(e)}")

@router.post("/", response_description="Create a new datacenter", status_code=201)
async def create_datacenter(datacenter_request: DatacenterCreateSimple):
    """
    Create a new datacenter with a specific style and modules

    Expects:
    - styleId: The ID of the datacenter style to use
    - modules: List of module positions to place in the datacenter
    - name (optional): Name for the datacenter
    - description (optional): Description for the datacenter
    """
    try:
        # Fetch the style
        style = style_repo.get_by_id(datacenter_request.styleId)
        if not style:
            raise HTTPException(status_code=404, detail=f"Datacenter style with ID {datacenter_request.styleId} not found")

        # Create datacenter base from style
        datacenter_base = {
            "name": datacenter_request.name or f"Datacenter using {style.get('name', 'unknown style')}",
            "description": datacenter_request.description or style.get('description', ''),
            "style_id": datacenter_request.styleId,
            "dim": style.get("dim", [1000, 1000]),
            "grid_connection": style.get("grid_connection", 0),
            "water_connection": style.get("water_connection", 0),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Create the datacenter first
        datacenter_id = datacenter_repo.create(datacenter_base)

        missing_modules = []
        placed_modules = []

        # Now process all modules
        for module_pos in datacenter_request.modules:
            # Verify the module exists
            module_info = module_repo.get_by_id(module_pos.id)
            if not module_info:
                missing_modules.append(module_pos.id)
                continue  # Skip if module not found

            # Create a placed module - only store the module_id, not the full module object
            placed_module = {
                "module_id": module_pos.id,
                "position": module_pos.position.dict(),
                "rotation": module_pos.rotation,
                "datacenter_id": datacenter_id
            }

            # Store full module info if available (can be referenced later)
            if module_info:
                # Convert ObjectId to string to make it JSON serializable
                if "_id" in module_info:
                    module_info["_id"] = str(module_info["_id"])
                placed_module["module"] = module_info

            # Add to database
            placed_id = placed_module_repo.create(placed_module)
            placed_modules.append(placed_id)

        # Fetch the complete datacenter with all placed modules
        new_datacenter = datacenter_repo.get_by_id(datacenter_id)

        response = {
            "datacenter": datacenter_esquema(new_datacenter),
            "message": "Datacenter created successfully"
        }

        # Add warnings for missing modules
        if missing_modules:
            response["warnings"] = {
                "missing_modules": missing_modules,
                "message": f"Some modules were not found: {', '.join(missing_modules)}"
            }

        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating datacenter: {str(e)}")

@router.put("/{id}", response_description="Update a datacenter")
async def update_datacenter(id: str, datacenter: DatacenterUpdate):
    """Update a datacenter"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Convert Pydantic model to dict, excluding None values
        update_data = {k: v for k, v in datacenter.dict().items() if v is not None}

        # Update the datacenter
        result = datacenter_repo.update(id, update_data)

        # Get updated datacenter
        updated = datacenter_repo.get_by_id(id)
        return datacenter_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating datacenter: {str(e)}")

@router.put("/{id}/layout", response_description="Update datacenter layout")
async def update_datacenter_layout(id: str, layout_request: DatacenterCreateSimple):
    """
    Update an existing datacenter's layout with new modules

    This replaces all existing modules with the new layout.
    """
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # If style ID is changing, update datacenter properties
        if layout_request.styleId != existing.get("style_id"):
            style = style_repo.get_by_id(layout_request.styleId)
            if not style:
                raise HTTPException(status_code=404, detail=f"Datacenter style with ID {layout_request.styleId} not found")

            # Update datacenter properties
            update_data = {
                "style_id": layout_request.styleId,
                "dim": style.get("dim", [1000, 1000]),
                "grid_connection": style.get("grid_connection", 0),
                "water_connection": style.get("water_connection", 0),
                "updated_at": datetime.utcnow().isoformat()
            }

            # Update name and description if provided
            if layout_request.name:
                update_data["name"] = layout_request.name
            if layout_request.description:
                update_data["description"] = layout_request.description

            datacenter_repo.update(id, update_data)

        # Delete all existing modules
        placed_module_repo.delete_by_datacenter_id(id)

        # Process all new modules
        for module_pos in layout_request.modules:
            # Verify the module exists
            module_info = module_repo.get_by_id(module_pos.id)
            if not module_info:
                continue  # Skip if module not found

            # Create a placed module - only store the module_id, not the full module
            placed_module = {
                "module": module_info,  # Full module info
                "module_id": module_pos.id,  # Also store the ID separately
                "position": module_pos.position.dict(),
                "rotation": module_pos.rotation,
                "datacenter_id": id
            }

            # Add to database
            placed_module_repo.create(placed_module)

        # Fetch the updated datacenter with all placed modules
        updated_datacenter = datacenter_repo.get_by_id(id)

        return {
            "datacenter": datacenter_esquema(updated_datacenter),
            "message": "Datacenter layout updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating datacenter layout: {str(e)}")

@router.delete("/{id}", response_description="Delete a datacenter")
async def delete_datacenter(id: str):
    """Delete a datacenter and all its placed modules"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Delete the datacenter
        result = datacenter_repo.delete(id)

        return {"message": f"Datacenter {id} and its modules deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting datacenter: {str(e)}")

@router.post("/{id}/modules", response_description="Add a module to a datacenter")
async def add_module_to_datacenter(id: str, placed_module: PlacedModule):
    """Add a new module to a datacenter"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Set the datacenter ID
        placed_module_dict = placed_module.dict()
        placed_module_dict["datacenter_id"] = id

        # Create the placed module
        module_id = placed_module_repo.create(placed_module_dict)

        # Get the updated datacenter
        updated = datacenter_repo.get_by_id(id)
        return datacenter_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding module to datacenter: {str(e)}")

@router.delete("/{id}/modules/{module_id}", response_description="Remove a module from a datacenter")
async def remove_module_from_datacenter(id: str, module_id: str):
    """Remove a module from a datacenter"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Verify module exists and belongs to this datacenter
        placed_module = placed_module_repo.get_by_id(module_id)
        if not placed_module:
            raise HTTPException(status_code=404, detail=f"Module with ID {module_id} not found")

        if placed_module.get("datacenter_id") != id:
            raise HTTPException(status_code=400, detail=f"Module {module_id} does not belong to datacenter {id}")

        # Delete the module
        result = placed_module_repo.delete(module_id)

        # Get the updated datacenter
        updated = datacenter_repo.get_by_id(id)
        return datacenter_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing module from datacenter: {str(e)}")

@router.get("/style/{style_id}", response_description="Get datacenters by style")
async def get_datacenters_by_style(style_id: str):
    """Get all datacenters using a specific style"""
    try:
        datacenters = datacenter_repo.get_by_style_id(style_id)
        return datacenters_esquema(datacenters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenters by style: {str(e)}")
