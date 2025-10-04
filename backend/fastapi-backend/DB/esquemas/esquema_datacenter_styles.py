from bson import ObjectId

def datacenter_style_esquema(style) -> dict:
    """
    Convert MongoDB datacenter style object to dictionary matching the TypeScript interface
    """
    if style is None:
        return None

    result = {
        "id": str(style["_id"]) if "_id" in style else style.get("id", ""),
        "name": style.get("name", "") or style.get("Name", ""),
        "description": style.get("description", "") or style.get("Description", ""),
        "grid_connection": style.get("grid_connection", 0) or style.get("Grid_Connection", 0),
        "water_connection": style.get("water_connection", 0) or style.get("Water_Connection", 0),
        "dim": style.get("dim") or [style.get("Space_X", 0), style.get("Space_Y", 0)],
        "focus": style.get("focus", "server") or style.get("Focus", "server")
    }

    # Handle nullable fields
    for nullable_field in ["processing", "price", "data_storage"]:
        field_value = style.get(nullable_field)
        if field_value is not None:
            result[nullable_field] = field_value
        else:
            # Check legacy capitalized version
            legacy_field = nullable_field.capitalize()
            legacy_value = style.get(legacy_field)
            if legacy_value is not None:
                result[nullable_field] = legacy_value
            else:
                result[nullable_field] = None

    # Handle optional array of recommended modules
    if "recommended_modules" in style:
        result["recommended_modules"] = style["recommended_modules"]
    elif "Recommended_Modules" in style:
        result["recommended_modules"] = style["Recommended_Modules"]

    return result

def datacenter_styles_esquema(styles) -> list:
    """
    Convert a list of MongoDB datacenter style objects to a list of dictionaries
    """
    return [datacenter_style_esquema(style) for style in styles]
