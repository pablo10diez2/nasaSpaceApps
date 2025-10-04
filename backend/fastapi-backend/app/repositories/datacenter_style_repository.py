from bson import ObjectId
from DB.cliente import get_database
from app.models.schemas import DatacenterStyle
from typing import List, Optional

class DatacenterStyleRepository:
    def __init__(self):
        db = get_database()
        self.collection = db["datacenter_styles"]

    def create(self, datacenter_style: dict) -> str:
        """Create a new datacenter style"""
        result = self.collection.insert_one(datacenter_style)
        return str(result.inserted_id)

    def get_by_id(self, id: str) -> Optional[dict]:
        """Get a datacenter style by ID"""
        if ObjectId.is_valid(id):
            return self.collection.find_one({"_id": ObjectId(id)})
        return self.collection.find_one({"id": id})

    def get_all(self) -> List[dict]:
        """Get all datacenter styles"""
        return list(self.collection.find())

    def update(self, id: str, datacenter_style: dict):
        """Update a datacenter style"""
        if ObjectId.is_valid(id):
            return self.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": datacenter_style}
            )
        return self.collection.update_one(
            {"id": id},
            {"$set": datacenter_style}
        )

    def delete(self, id: str):
        """Delete a datacenter style"""
        if ObjectId.is_valid(id):
            return self.collection.delete_one({"_id": ObjectId(id)})
        return self.collection.delete_one({"id": id})

    def get_by_focus(self, focus: str) -> List[dict]:
        """Get datacenter styles by focus type"""
        return list(self.collection.find({"focus": focus}))

    def bulk_create(self, styles: List[dict]) -> List[str]:
        """Create multiple datacenter styles at once"""
        if not styles:
            return []
        result = self.collection.insert_many(styles)
        return [str(id) for id in result.inserted_ids]
