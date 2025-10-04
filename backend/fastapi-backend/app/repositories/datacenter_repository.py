from bson import ObjectId
from DB.cliente import get_database
from typing import List, Optional, Dict, Any
from datetime import datetime

class DatacenterRepository:
    def __init__(self):
        db = get_database()
        self.collection = db["datacenters"]
        self.placed_modules_collection = db["placed_modules"]

    def create(self, datacenter: dict) -> str:
        """Create a new datacenter"""
        # Set timestamps
        datacenter["created_at"] = datetime.utcnow().isoformat()
        datacenter["updated_at"] = datacenter["created_at"]

        # Store modules separately if they exist
        modules = datacenter.pop("modules", [])

        # Insert the datacenter
        result = self.collection.insert_one(datacenter)
        datacenter_id = str(result.inserted_id)

        # Add datacenter_id to modules and insert them if they exist
        if modules:
            for module in modules:
                module["datacenter_id"] = datacenter_id

            self.placed_modules_collection.insert_many(modules)

        return datacenter_id

    def get_by_id(self, id: str, include_modules: bool = True) -> Optional[dict]:
        """Get a datacenter by ID"""
        # First try as ObjectId
        if ObjectId.is_valid(id):
            datacenter = self.collection.find_one({"_id": ObjectId(id)})
            if datacenter:
                return self._populate_modules(datacenter) if include_modules else datacenter

        # Try with string ID
        datacenter = self.collection.find_one({"id": id})
        if datacenter:
            return self._populate_modules(datacenter) if include_modules else datacenter

        return None

    def get_all(self, include_modules: bool = False) -> List[dict]:
        """Get all datacenters"""
        datacenters = list(self.collection.find())

        if include_modules:
            return [self._populate_modules(dc) for dc in datacenters]

        return datacenters

    def update(self, id: str, datacenter_data: dict) -> Any:
        """Update a datacenter"""
        # Update timestamp
        datacenter_data["updated_at"] = datetime.utcnow().isoformat()

        # Handle modules separately
        modules = datacenter_data.pop("modules", None)

        # Update the datacenter
        filter_query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
        result = self.collection.update_one(filter_query, {"$set": datacenter_data})

        # If modules are provided, replace all existing modules
        if modules is not None:
            self.placed_modules_collection.delete_many({"datacenter_id": id})

            if modules:
                for module in modules:
                    module["datacenter_id"] = id

                self.placed_modules_collection.insert_many(modules)

        return result

    def delete(self, id: str) -> Any:
        """Delete a datacenter and all its modules"""
        # First delete associated modules
        self.placed_modules_collection.delete_many({"datacenter_id": id})

        # Then delete the datacenter
        filter_query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
        return self.collection.delete_one(filter_query)

    def _populate_modules(self, datacenter: dict) -> dict:
        """Populate the modules field with the placed modules for this datacenter"""
        datacenter_id = str(datacenter["_id"]) if "_id" in datacenter else datacenter.get("id")
        modules = list(self.placed_modules_collection.find({"datacenter_id": datacenter_id}))
        datacenter["modules"] = modules
        return datacenter

    def search(self, query: str, limit: int = 10) -> List[dict]:
        """Search datacenters by name or description"""
        filter_query = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}}
            ]
        }
        return list(self.collection.find(filter_query).limit(limit))

    def get_by_style_id(self, style_id: str) -> List[dict]:
        """Get datacenters by style ID"""
        return list(self.collection.find({"style_id": style_id}))
