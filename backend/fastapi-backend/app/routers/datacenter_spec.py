from fastapi import APIRouter, HTTPException, File, UploadFile
from typing import List
from bson import ObjectId
from app.models.schemas import DatacenterSpec
from app.repositories.datacenter_spec_repository import DatacenterSpecRepository
from DB.cliente import cliente_modulos
from DB.esquemas.esquema_datacenter_specs import datacenter_spec_esquema, datacenter_specs_esquema
import csv
import io
from pydantic import BaseModel

# Update router with prefix and tags for API documentation
router = APIRouter(
    prefix="/datacenter-specs",
    tags=["datacenter_specs"]
)
datacenter_spec_repo = DatacenterSpecRepository()

# Import request model
class CSVImportRequest(BaseModel):
    csv_data: str

# Update the original routes to use English error messages
# Note: Removed duplicate routes and standardized endpoints
@router.get("/", response_description="List all datacenter specifications")
async def list_datacenter_specs():
    """Get all datacenter specifications."""
    try:
        datacenter_specs = datacenter_spec_repo.get_all()
        return datacenter_specs_esquema(datacenter_specs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving specifications: {str(e)}")

@router.get("/{id}", response_description="Get a datacenter specification by id")
async def get_datacenter_spec(id: str):
    """Get a datacenter specification by ID."""
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail=f"Invalid ID format: {id}")

        datacenter_spec = datacenter_spec_repo.get_by_id(id)
        if datacenter_spec is None:
            raise HTTPException(status_code=404, detail=f"Datacenter specification {id} not found")

        return datacenter_spec_esquema(datacenter_spec)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving specification: {str(e)}")

@router.post("/", response_description="Create a new datacenter specification", status_code=201)
async def create_datacenter_spec(datacenter_spec: DatacenterSpec):
    """Create a new datacenter specification."""
    try:
        datacenter_spec_dict = datacenter_spec.dict(exclude={"id"})
        id = datacenter_spec_repo.create(datacenter_spec_dict)
        new_spec = datacenter_spec_repo.get_by_id(id)
        return datacenter_spec_esquema(new_spec)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating specification: {str(e)}")

@router.put("/{id}", response_description="Update a datacenter specification")
async def update_datacenter_spec(id: str, datacenter_spec: DatacenterSpec):
    """Update a datacenter specification."""
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail=f"Invalid ID format: {id}")

        datacenter_spec_dict = datacenter_spec.dict(exclude={"id"})
        result = datacenter_spec_repo.update(id, datacenter_spec_dict)

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail=f"Datacenter specification {id} not found")

        updated_spec = datacenter_spec_repo.get_by_id(id)
        return datacenter_spec_esquema(updated_spec)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating specification: {str(e)}")

@router.delete("/{id}", response_description="Delete a datacenter specification")
async def delete_datacenter_spec(id: str):
    """Delete a datacenter specification."""
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail=f"Invalid ID format: {id}")

        result = datacenter_spec_repo.delete(id)

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"Datacenter specification {id} not found")

        return {"message": f"Datacenter specification {id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting specification: {str(e)}")

# CSV import functionality
@router.post("/import", response_description="Import datacenter specifications from CSV")
async def import_datacenter_specs(import_request: CSVImportRequest):
    """
    Import datacenter specifications from CSV data.

    CSV Format: ID;Name;Below_Amount;Above_Amount;Minimize;Maximize;Unconstrained;Unit;Amount
    """
    specs_to_insert = []
    try:
        for row in import_request.csv_data.strip().split("\n"):
            if not row.strip():
                continue

            parts = row.split(";")
            if len(parts) != 9:
                continue  # Skip invalid rows

            spec = {
                "ID": parts[0],
                "Name": parts[1],
                "Below_Amount": int(parts[2]),
                "Above_Amount": int(parts[3]),
                "Minimize": int(parts[4]),
                "Maximize": int(parts[5]),
                "Unconstrained": int(parts[6]),
                "Unit": parts[7],
                "Amount": int(parts[8])
            }
            specs_to_insert.append(spec)

        result = datacenter_spec_repo.bulk_create(specs_to_insert)
        return {"message": f"Imported {len(result)} datacenter specifications"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing data: {str(e)}")

@router.get("/component/{component_id}", response_description="Get all specifications for a component")
async def get_component_specs(component_id: str):
    """Get all specifications for a specific component."""
    try:
        specs = datacenter_spec_repo.get_by_component_id(component_id)
        if not specs:
            raise HTTPException(status_code=404, detail=f"No specifications found for component {component_id}")

        return datacenter_specs_esquema(specs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving component specifications: {str(e)}")

@router.delete("/all", response_description="Delete all datacenter specifications")
async def delete_all_specs():
    """
    Delete all datacenter specifications from the database.
    WARNING: This will remove ALL specifications and cannot be undone.
    """
    try:
        count = datacenter_spec_repo.collection.count_documents({})

        result = datacenter_spec_repo.collection.delete_many({})

        if result.deleted_count == 0:
            return {"message": "No datacenter specifications found to delete"}

        return {
            "message": f"Successfully deleted {result.deleted_count} datacenter specifications",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting datacenter specifications: {str(e)}")

@router.get("/test", response_description="Test endpoint")
async def test_endpoint():
    return {"message": "The datacenter-specs router is working"}
