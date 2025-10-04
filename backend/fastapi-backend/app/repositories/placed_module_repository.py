from bson import ObjectId
from DB.cliente import get_database
from typing import List, Optional, Dict, Any

class PlacedModuleRepository:
    def __init__(self):
        db = get_database()
        self.collection = db["placed_modules"]
        self.modules_collection = db["modules"]

    def create(self, placed_module: dict) -> str:
        """Create a new placed module"""
        try:
            # Save module reference instead of embedding if it's a dict
            if "module" in placed_module and isinstance(placed_module["module"], dict) and "id" in placed_module["module"]:
                module_id = placed_module["module"]["id"]
                placed_module["module_id"] = module_id

            # Ensure we have a module_id
            if "module_id" not in placed_module:
                # Try to extract from module if present
                if "module" in placed_module and isinstance(placed_module["module"], dict):
                    if "id" in placed_module["module"]:
                        placed_module["module_id"] = placed_module["module"]["id"]
                    elif "_id" in placed_module["module"]:
                        placed_module["module_id"] = str(placed_module["module"]["_id"])

            result = self.collection.insert_one(placed_module)
            return str(result.inserted_id)
        except Exception as e:
            # Log error for debugging
            print(f"Error creating placed module: {str(e)}")
            raise

    def get_by_id(self, id: str) -> Optional[dict]:
        """Get a placed module by ID"""
        if ObjectId.is_valid(id):
            placed_module = self.collection.find_one({"_id": ObjectId(id)})
            if placed_module:
                return self._populate_module(placed_module)

        # Try with string ID
        placed_module = self.collection.find_one({"id": id})
        if placed_module:
            return self._populate_module(placed_module)

        return None

    def get_all(self) -> List[dict]:
        """Get all placed modules"""
        placed_modules = list(self.collection.find())
        return [self._populate_module(pm) for pm in placed_modules]

    def get_by_datacenter_id(self, datacenter_id: str) -> List[dict]:
        """Get all placed modules for a specific datacenter"""
        placed_modules = list(self.collection.find({"datacenter_id": datacenter_id}))
        return [self._populate_module(pm) for pm in placed_modules]

    def update(self, id: str, placed_module_data: dict) -> Any:
        """Update a placed module"""
        # Handle module reference
        if "module" in placed_module_data and isinstance(placed_module_data["module"], dict) and "id" in placed_module_data["module"]:
            placed_module_data["module_id"] = placed_module_data["module"]["id"]
            placed_module_data.pop("module", None)

        filter_query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
        return self.collection.update_one(filter_query, {"$set": placed_module_data})

    def delete(self, id: str) -> Any:
        """Delete a placed module"""
        filter_query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
        return self.collection.delete_one(filter_query)

    def delete_by_datacenter_id(self, datacenter_id: str) -> int:
        """Delete all placed modules for a datacenter"""
        result = self.collection.delete_many({"datacenter_id": datacenter_id})
        return result.deleted_count

    def bulk_create(self, placed_modules: List[dict]) -> List[str]:
        """Create multiple placed modules at once"""
        for pm in placed_modules:
            # Handle module reference
            if "module" in pm and isinstance(pm["module"], dict) and "id" in pm["module"]:
                pm["module_id"] = pm["module"]["id"]
                pm.pop("module", None)

        result = self.collection.insert_many(placed_modules)
        return [str(id) for id in result.inserted_ids]

    def _populate_module(self, placed_module: dict) -> dict:
        """Populate the module data if only the ID is stored"""
        if "module_id" in placed_module and ("module" not in placed_module or placed_module["module"] is None):
            module = self.modules_collection.find_one({"id": placed_module["module_id"]})
            if not module and ObjectId.is_valid(placed_module["module_id"]):
                module = self.modules_collection.find_one({"_id": ObjectId(placed_module["module_id"])})

            if module:
                placed_module["module"] = module

        return placed_module
