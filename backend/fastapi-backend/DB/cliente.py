from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_database():
    """
    Function to get a database connection to MongoDB Atlas
    Returns a database connection object
    """
    mongodb_uri = os.getenv("MONGODB_URI")

    if not mongodb_uri:
        raise Exception("MONGODB_URI is not set in the environment variables")

    client = MongoClient(mongodb_uri, server_api=ServerApi('1'))

    try:
        client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise e

    db_name = os.getenv("MONGODB_DB_NAME", "datacenter_designer")
    db = client[db_name]

    return db

db = get_database()
cliente_modulos = db

def insert_document(collection_name, document):
    """Insert a document into a collection"""
    db = get_database()
    collection = db[collection_name]
    return collection.insert_one(document)

def find_documents(collection_name, query={}):
    """Find documents in a collection"""
    db = get_database()
    collection = db[collection_name]
    return list(collection.find(query))

def update_document(collection_name, query, update_data):
    """Update a document in a collection"""
    db = get_database()
    collection = db[collection_name]
    return collection.update_one(query, {"$set": update_data})

def delete_document(collection_name, query):
    """Delete a document from a collection"""
    db = get_database()
    collection = db[collection_name]
    return collection.delete_one(query)
