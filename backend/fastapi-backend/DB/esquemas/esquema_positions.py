def position_esquema(position) -> dict:
    """
    Convert MongoDB position object to dictionary
    """
    if position is None:
        return None

    return {
        "id": str(position["_id"]) if "_id" in position else position.get("id", ""),
        "x": position.get("x", 0),
        "y": position.get("y", 0),
        "name": position.get("name", None),  # Optional field for labeling positions
        "module_id": position.get("module_id", None),  # Reference to a module if needed
        "datacenter_id": position.get("datacenter_id", None)  # Reference to datacenter
    }

def positions_esquema(positions) -> list:
    """
    Convert a list of MongoDB position objects to a list of dictionaries
    """
    return [position_esquema(pos) for pos in positions]
