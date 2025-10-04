from bson import ObjectId
from DB.esquemas.esquema_modules import module_esquema

def placed_module_esquema(placed_module) -> dict:
    """
    Convert MongoDB placed module object to dictionary
    """
    if placed_module is None:
        return None

    result = {
        "id": str(placed_module["_id"]) if "_id" in placed_module else placed_module.get("id", ""),
        "position": {
            "x": placed_module.get("position", {}).get("x", 0),
            "y": placed_module.get("position", {}).get("y", 0)
        },
        "rotation": placed_module.get("rotation", 0),
        "datacenter_id": placed_module.get("datacenter_id", None)
    }

    # Handle module data - could be embedded or referenced
    if "module" in placed_module:
        if isinstance(placed_module["module"], dict):
            # Embedded module
            result["module"] = module_esquema(placed_module["module"])
        else:
            # Just the ID was stored
            result["module_id"] = str(placed_module["module"])
            result["module"] = None
    elif "module_id" in placed_module:
        # Store the module ID separately
        result["module_id"] = placed_module["module_id"]
        result["module"] = None

    return result

def placed_modules_esquema(placed_modules) -> list:
    """
    Convert a list of MongoDB placed module objects to a list of dictionaries
    """
    return [placed_module_esquema(pm) for pm in placed_modules]
