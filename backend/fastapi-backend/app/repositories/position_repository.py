from bson import ObjectId
from DB.cliente import get_database
from typing import List, Optional, Dict, Any

class PositionRepository:
    def __init__(self):
        db = get_database()
        self.collection = db["positions"]

    def create(self, position: dict) -> str:
        """Create a new position"""
        result = self.collection.insert_one(position)
        return str(result.inserted_id)

    def get_by_id(self, id: str) -> Optional[dict]:
        """Get a position by ID"""
        if ObjectId.is_valid(id):
            position = self.collection.find_one({"_id": ObjectId(id)})
            if position:
                return position

        # Try with string ID
        position = self.collection.find_one({"id": id})
        return position

    def get_all(self) -> List[dict]:
        """Get all positions"""
        return list(self.collection.find())

    def get_by_datacenter_id(self, datacenter_id: str) -> List[dict]:
        """Get all positions for a specific datacenter"""
        return list(self.collection.find({"datacenter_id": datacenter_id}))

    def get_by_module_id(self, module_id: str) -> Optional[dict]:
        """Get position for a specific module"""
        return self.collection.find_one({"module_id": module_id})

    def update(self, id: str, position_data: dict) -> Any:
        """Update a position"""
        filter_query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
        return self.collection.update_one(filter_query, {"$set": position_data})

    def delete(self, id: str) -> Any:
        """Delete a position"""
        filter_query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
        return self.collection.delete_one(filter_query)

    def delete_by_datacenter_id(self, datacenter_id: str) -> int:
        """Delete all positions for a datacenter"""
        result = self.collection.delete_many({"datacenter_id": datacenter_id})
        return result.deleted_count

    def find_positions_in_area(self, x1: int, y1: int, x2: int, y2: int, datacenter_id: Optional[str] = None) -> List[dict]:
        """Find all positions within a rectangular area"""
        query = {
            "x": {"$gte": min(x1, x2), "$lte": max(x1, x2)},
            "y": {"$gte": min(y1, y2), "$lte": max(y1, y2)}
        }

        if datacenter_id:
            query["datacenter_id"] = datacenter_id

        return list(self.collection.find(query))

    def bulk_create(self, positions: List[dict]) -> List[str]:
        """Create multiple positions at once"""
        result = self.collection.insert_many(positions)
        return [str(id) for id in result.inserted_ids]
