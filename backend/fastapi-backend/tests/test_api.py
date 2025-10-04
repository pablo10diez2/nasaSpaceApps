from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_example_endpoint():
    response = client.get("/example")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}  # Adjust based on actual response structure

def test_another_endpoint():
    response = client.post("/another", json={"key": "value"})
    assert response.status_code == 201
    assert response.json() == {"result": "success"}  # Adjust based on actual response structure