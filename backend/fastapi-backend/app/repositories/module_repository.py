from bson import ObjectId
from DB.cliente import get_database
from app.models.schemas import Module
from typing import List, Optional

class ModuleRepository:
    def __init__(self):
        db = get_database()
        self.collection = db["modules"]

    def create(self, module: dict) -> str:
        result = self.collection.insert_one(module)
        return str(result.inserted_id)

    def get_by_id(self, id: str) -> Optional[dict]:
        """Get a module by ID"""
        # First try by string ID (most likely for frontend-provided IDs)
        module = self.collection.find_one({"id": id})
        if module:
            return module

        # Try with a case-insensitive search (for robustness)
        module = self.collection.find_one({"id": {"$regex": f"^{id}$", "$options": "i"}})
        if module:
            return module

        # Try as ObjectId (for MongoDB's _id field)
        if ObjectId.is_valid(id):
            module = self.collection.find_one({"_id": ObjectId(id)})
            if module:
                return module

        # Try legacy ID field
        module = self.collection.find_one({"ID": id})
        if module:
            return module

        return None

    def get_all(self):
        return list(self.collection.find())

    def get_by_field(self, field: str, value):
        """Get modules by any field value"""
        return list(self.collection.find({field: value}))

    def update(self, id: str, module: dict):
        return self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": module}
        )

    def delete(self, id: str):
        return self.collection.delete_one({"_id": ObjectId(id)})

    def bulk_create(self, modules: list) -> list:
        """Insert multiple modules at once"""
        if not modules:
            return []
        result = self.collection.insert_many(modules)
        return [str(id) for id in result.inserted_ids]

    def count(self):
        """Count total modules in collection"""
        return self.collection.count_documents({})

    def validate_object_id(self, id: str):
        """Validate that a string is a valid MongoDB ObjectId"""
        if not ObjectId.is_valid(id):
            raise ValueError("Invalid ID format")  # English error message
