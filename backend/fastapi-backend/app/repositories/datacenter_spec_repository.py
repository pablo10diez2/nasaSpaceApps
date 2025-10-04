from bson import ObjectId
from DB.cliente import get_database
from app.models.schemas import DatacenterSpec
from typing import List, Dict, Any, Optional

class DatacenterSpecRepository:
    def __init__(self):
        db = get_database()
        self.collection = db["datacenter_specs"]

    def create(self, datacenter_spec: dict) -> str:
        result = self.collection.insert_one(datacenter_spec)
        return str(result.inserted_id)

    def get_by_id(self, id: str):
        return self.collection.find_one({"_id": ObjectId(id)})

    def get_all(self):
        return list(self.collection.find())

    def update(self, id: str, datacenter_spec: dict):
        return self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": datacenter_spec}
        )

    def delete(self, id: str):
        return self.collection.delete_one({"_id": ObjectId(id)})

    def bulk_create(self, datacenter_specs: list) -> list:
        """Insert multiple datacenter specs at once"""
        if not datacenter_specs:
            return []
        result = self.collection.insert_many(datacenter_specs)
        return [str(id) for id in result.inserted_ids]

    def get_by_component_id(self, component_id: str):
        """Get all specs for a specific component ID"""
        return list(self.collection.find({"ID": component_id}))

    def get_by_component_and_unit(self, component_id: str, unit: str):
        """Get a specific component property by ID and Unit"""
        return self.collection.find_one({"ID": component_id, "Unit": unit})

    def get_by_focus(self, focus: str):
        """Get all datacenter specs with a specific focus"""
        return list(self.collection.find({"focus": focus}))

    def get_complete_datacenter_spec(self, id: str) -> Optional[Dict[str, Any]]:
        """
        Get a complete datacenter spec by ID with all properties merged

        This combines all individual specs for the same datacenter ID into
        a single comprehensive object with all properties.
        """
        if not id:
            return None

        # Get base record
        query = {"ID": id} if not ObjectId.is_valid(id) else {"$or": [{"_id": ObjectId(id)}, {"ID": id}]}
        specs = list(self.collection.find(query))

        if not specs:
            return None

        # Start with the first record
        complete_spec = dict(specs[0])

        # Add _id as string for API response
        complete_spec["id"] = str(complete_spec["_id"]) if "_id" in complete_spec else None

        # Merge all unit-specific properties
        for spec in specs[1:]:
            unit = spec.get("Unit")
            amount = spec.get("Amount")

            if unit and amount:
                # Convert unit name to snake_case field name
                field_name = unit.lower().replace(" ", "_")
                complete_spec[field_name] = amount

                # Also handle specific field name mappings
                if unit == "Data storage":
                    complete_spec["data_storage"] = amount
                elif unit == "Processing":
                    complete_spec["processing"] = amount

        return complete_spec

    def delete_all(self):
        """Delete all datacenter specs"""
        return self.collection.delete_many({})
