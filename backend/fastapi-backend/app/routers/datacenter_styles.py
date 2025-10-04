from fastapi import APIRouter, HTTPException
from typing import List, Optional
from bson import ObjectId
from app.models.schemas import DatacenterStyle
from app.repositories.datacenter_style_repository import DatacenterStyleRepository
from DB.esquemas.esquema_datacenter_styles import datacenter_style_esquema, datacenter_styles_esquema
from pydantic import BaseModel

router = APIRouter(
    prefix="/datacenter-styles",
    tags=["datacenter_styles"],
    responses={404: {"description": "Not found"}}
)

datacenter_style_repo = DatacenterStyleRepository()

class StylesImport(BaseModel):
    styles: List[DatacenterStyle]

class CSVImportRequest(BaseModel):
    csv_data: str

class StylesImportRequest(BaseModel):
    styles: List[dict]

@router.get("/", response_description="Get all datacenter styles")
async def get_all_datacenter_styles():
    """Get all available datacenter styles"""
    styles = datacenter_style_repo.get_all()
    return datacenter_styles_esquema(styles)

@router.get("/{id}", response_description="Get a datacenter style by ID")
async def get_datacenter_style(id: str):
    """Get a specific datacenter style by ID"""
    style = datacenter_style_repo.get_by_id(id)
    if not style:
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    return datacenter_style_esquema(style)

@router.post("/", response_description="Create a new datacenter style", status_code=201)
async def create_datacenter_style(style: DatacenterStyle):
    """Create a new datacenter style"""
    try:
        style_dict = style.dict()
        id = datacenter_style_repo.create(style_dict)
        new_style = datacenter_style_repo.get_by_id(id)
        return datacenter_style_esquema(new_style)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating datacenter style: {str(e)}")

@router.put("/{id}", response_description="Update a datacenter style")
async def update_datacenter_style(id: str, style: DatacenterStyle):
    """Update an existing datacenter style"""
    if not ObjectId.is_valid(id) and not any(datacenter_style_repo.get_by_id(id)):
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    style_dict = style.dict(exclude={"id"})
    result = datacenter_style_repo.update(id, style_dict)

    if result.modified_count == 0:
        raise HTTPException(status_code=304, detail=f"Datacenter style {id} was not modified")

    updated_style = datacenter_style_repo.get_by_id(id)
    return datacenter_style_esquema(updated_style)

@router.delete("/{id}", response_description="Delete a datacenter style")
async def delete_datacenter_style(id: str):
    """Delete a datacenter style"""
    if not ObjectId.is_valid(id) and not any(datacenter_style_repo.get_by_id(id)):
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    result = datacenter_style_repo.delete(id)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    return {"message": f"Datacenter style {id} deleted successfully"}

@router.get("/focus/{focus}", response_description="Get datacenter styles by focus")
async def get_datacenter_styles_by_focus(focus: str):
    """Get all datacenter styles of a specific focus type"""
    valid_focuses = ["processing", "storage", "network", "server"]
    if focus not in valid_focuses:
        raise HTTPException(status_code=400, detail=f"Invalid focus: {focus}. Must be one of {valid_focuses}")

    styles = datacenter_style_repo.get_by_focus(focus)
    return datacenter_styles_esquema(styles)

@router.post("/import", response_description="Import datacenter styles", status_code=201)
async def import_datacenter_styles(styles: List[DatacenterStyle]):
    """
    Import multiple datacenter styles at once.

    This endpoint accepts a list of datacenter style objects and adds them to the database.
    """
    try:
        if not styles:
            raise HTTPException(status_code=400, detail="No styles to import")

        # Convert each style to a dictionary
        styles_to_insert = [style.dict() for style in styles]

        # Fix any invalid dimensions or values
        for style in styles_to_insert:
            # Replace any -1 values with reasonable defaults
            if style.get("dim") and (style["dim"][0] < 0 or style["dim"][1] < 0):
                style["dim"] = [1000, 1000]  # Default size

            # Ensure grid and water connections are positive
            if style.get("grid_connection", 0) < 0:
                style["grid_connection"] = abs(style["grid_connection"])

            if style.get("water_connection", 0) < 0:
                style["water_connection"] = abs(style["water_connection"])

            # Replace -1 in data_storage with a reasonable value
            if style.get("data_storage") == -1:
                style["data_storage"] = 5000

            # Replace -1 in processing with a reasonable value
            if style.get("processing") == -1:
                style["processing"] = 5000

        result = datacenter_style_repo.bulk_create(styles_to_insert)

        return {
            "message": f"Successfully imported {len(result)} datacenter styles",
            "imported_count": len(result),
            "styles": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing datacenter styles: {str(e)}")

@router.post("/csv-import", response_description="Import datacenter styles from CSV data", status_code=201)
async def import_datacenter_styles_csv(import_request: CSVImportRequest):
    """
    Import datacenter styles from CSV data.

    CSV Format: id;name;description;grid_connection;water_connection;dim_x;dim_y;data_storage;processing;price;focus
    """
    styles_to_insert = []
    try:
        for row in import_request.csv_data.strip().split("\n"):
            if not row.strip():
                continue

            parts = row.split(";")
            if len(parts) < 10:
                continue  # Skip invalid rows

            # Handle optional fields with defaults
            focus = parts[10].strip() if len(parts) > 10 else "server"
            if focus not in ["processing", "storage", "network", "server"]:
                focus = "server"

            # Parse dimensions
            dim_x = int(parts[5]) if parts[5] and parts[5] != "-1" else 1000
            dim_y = int(parts[6]) if parts[6] and parts[6] != "-1" else 1000

            # Handle nullable fields
            data_storage = None
            if parts[7] and parts[7] != "null" and parts[7] != "-1":
                data_storage = int(parts[7])

            processing = None
            if parts[8] and parts[8] != "null" and parts[8] != "-1":
                processing = int(parts[8])

            price = None
            if parts[9] and parts[9] != "null" and parts[9] != "-1":
                price = int(parts[9])

            style = {
                "id": parts[0],
                "name": parts[1],
                "description": parts[2],
                "grid_connection": max(1, int(parts[3])),  # Ensure positive
                "water_connection": max(1, int(parts[4])),  # Ensure positive
                "dim": [dim_x, dim_y],
                "data_storage": data_storage,
                "processing": processing,
                "price": price,
                "focus": focus
            }
            styles_to_insert.append(style)

        if not styles_to_insert:
            raise HTTPException(status_code=400, detail="No valid styles found in CSV data")

        result = datacenter_style_repo.bulk_create(styles_to_insert)
        return {
            "message": f"Successfully imported {len(result)} datacenter styles",
            "imported_count": len(result)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing datacenter styles: {str(e)}")

@router.post("/json-import", response_description="Import datacenter styles from JSON data", status_code=201)
async def import_datacenter_styles_json(import_request: StylesImportRequest):
    """
    Import multiple datacenter styles from JSON data.

    Accepts a list of datacenter style objects under the 'styles' key and adds them to the database.
    Each style must have id, name, description, grid_connection, water_connection,
    dim fields, and optionally data_storage, processing, price, and focus.
    """
    try:
        if not import_request.styles:
            raise HTTPException(status_code=400, detail="No styles to import")

        styles_to_insert = []

        for style_data in import_request.styles:
            required_fields = ["id", "name", "description"]
            for field in required_fields:
                if field not in style_data:
                    raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

            # Set default values for optional fields
            if "grid_connection" not in style_data or style_data["grid_connection"] < 0:
                style_data["grid_connection"] = 1

            if "water_connection" not in style_data or style_data["water_connection"] < 0:
                style_data["water_connection"] = 1

            # Fix dimensions
            if "dim" not in style_data or not isinstance(style_data["dim"], list) or len(style_data["dim"]) != 2:
                style_data["dim"] = [1000, 1000]
            elif style_data["dim"][0] <= 0 or style_data["dim"][1] <= 0:
                style_data["dim"] = [1000, 1000]

            # Ensure focus is valid
            if "focus" not in style_data or style_data["focus"] not in ["processing", "storage", "network", "server"]:
                style_data["focus"] = "server"

            styles_to_insert.append(style_data)

        # Insert into database
        result = datacenter_style_repo.bulk_create(styles_to_insert)

        return {
            "message": f"Successfully imported {len(result)} datacenter styles",
            "imported_count": len(result),
            "ids": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing datacenter styles: {str(e)}")

@router.delete("/all", response_description="Delete all datacenter styles")
async def delete_all_datacenter_styles(confirm: bool = False):
    """
    Delete all datacenter styles.
    WARNING: This will remove ALL datacenter styles and cannot be undone.
    """
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Confirmation required. Set 'confirm=true' to proceed with deletion."
        )

    try:
        result = datacenter_style_repo.collection.delete_many({})
        return {
            "message": f"Successfully deleted {result.deleted_count} datacenter styles",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting datacenter styles: {str(e)}")
