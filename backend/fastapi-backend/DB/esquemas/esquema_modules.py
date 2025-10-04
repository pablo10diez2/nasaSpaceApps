def module_esquema(module) -> dict:
    """
    Convert MongoDB module object to dictionary with all fields
    Handles both legacy and modern module formats
    """
    if module is None:
        return None

    # Start with basic required fields
    result = {
        "id": str(module["_id"]) if "_id" in module else module.get("id", "")
    }

    # Add ID as legacy field if needed
    if "_id" in module and "ID" not in module:
        result["ID"] = str(module["_id"])
    elif "ID" in module:
        result["ID"] = module["ID"]

    # Add legacy fields if they exist
    legacy_fields = ["Name", "Is_Input", "Is_Output", "Unit", "Amount"]
    for field in legacy_fields:
        if field in module:
            result[field] = module[field]

    # Try to derive module type from Name if not present
    if "type" not in module and "Name" in module:
        name_parts = module["Name"].split("_")
        if name_parts:
            result["type"] = name_parts[0].lower()

    # Add dimensions if present in various formats
    if "dim" in module:
        result["dim"] = module["dim"]
    elif "Space_X" in module and "Space_Y" in module:
        result["dim"] = [module["Space_X"], module["Space_Y"]]

    # Process all modern fields that might exist
    modern_fields = [
        "price", "description",
        "supplied_water", "water_usage", "chilled_water", "distilled_water", "fresh_water",
        "usable_power", "processing", "storage_capacity", "network_capacity",
        "internal_network", "external_network", "data_storage",
        "grid_connection", "water_connection"
    ]

    for field in modern_fields:
        # Check direct field match
        if field in module:
            result[field] = module[field]

        # Check for legacy-style field (capitalized with underscores)
        legacy_style = field.title().replace("_", " ").replace(" ", "_")
        if legacy_style in module:
            result[field] = module[legacy_style]

    # Handle specific fields that have different naming conventions
    field_mappings = {
        "Usable_Power": "usable_power",
        "Grid_Connection": "grid_connection",
        "Water_Connection": "water_connection",
        "Fresh_Water": "fresh_water",
        "Distilled_Water": "distilled_water",
        "Chilled_Water": "chilled_water",
        "Internal_Network": "internal_network",
        "External_Network": "external_network",
        "Data_Storage": "data_storage",
        "Processing": "processing",
        "Price": "price",
        "Description": "description"
    }

    for db_field, api_field in field_mappings.items():
        if db_field in module and api_field not in result:
            result[api_field] = module[db_field]

    return result

def modules_esquema(modules) -> list:
    """
    Convert a list of MongoDB module objects to a list of dictionaries
    showing all existing data with minimal transformation
    """
    result = []

    for module in modules:
        # Create a copy of the module to avoid modifying the original
        module_dict = dict(module)

        # Convert ObjectId to string for JSON serialization
        if "_id" in module_dict:
            module_dict["_id"] = str(module_dict["_id"])

        # Add id field for consistency if not present but _id exists
        if "id" not in module_dict and "_id" in module:
            module_dict["id"] = str(module["_id"])

        result.append(module_dict)

    return result
