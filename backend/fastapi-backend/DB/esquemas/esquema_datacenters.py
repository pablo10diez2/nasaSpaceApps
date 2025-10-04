from DB.esquemas.esquema_placed_modules import placed_module_esquema, placed_modules_esquema
from datetime import datetime

def datacenter_esquema(datacenter) -> dict:
    """
    Convert MongoDB datacenter object to dictionary
    """
    if datacenter is None:
        return None

    result = {
        "id": str(datacenter["_id"]) if "_id" in datacenter else datacenter.get("id", ""),
        "name": datacenter.get("name", ""),
        "description": datacenter.get("description", None),
        "created_at": datacenter.get("created_at", datetime.utcnow().isoformat()),
        "updated_at": datacenter.get("updated_at", datetime.utcnow().isoformat()),
        "style_id": datacenter.get("style_id", None),
        "dim": datacenter.get("dim", [1000, 1000]),
        "grid_connection": datacenter.get("grid_connection", 0),
        "water_connection": datacenter.get("water_connection", 0)
    }

    # Convert modules if they exist
    if "modules" in datacenter and datacenter["modules"]:
        result["modules"] = placed_modules_esquema(datacenter["modules"])
    else:
        result["modules"] = []

    return result

def datacenter_esquema_minimal(datacenter) -> dict:
    """
    Convert MongoDB datacenter object to a minimal dictionary with essential fields
    """
    if datacenter is None:
        return None

    return {
        "id": str(datacenter["_id"]) if "_id" in datacenter else datacenter.get("id", ""),
        "name": datacenter.get("name", ""),
        "description": datacenter.get("description", None),
        "created_at": datacenter.get("created_at", datetime.utcnow().isoformat()),
        "updated_at": datacenter.get("updated_at", datetime.utcnow().isoformat()),
        "style_id": datacenter.get("style_id", None)
    }

def datacenters_esquema(datacenters) -> list:
    """
    Convert a list of MongoDB datacenter objects to a list of dictionaries
    """
    return [datacenter_esquema(dc) for dc in datacenters]

def datacenters_esquema_minimal(datacenters) -> list:
    """
    Convert a list of MongoDB datacenter objects to a list of minimal dictionaries
    """
    return [datacenter_esquema_minimal(dc) for dc in datacenters]
