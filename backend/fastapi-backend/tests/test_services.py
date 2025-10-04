from fastapi import FastAPI
from app.services.backend_service import some_backend_function  # Adjust the import based on your actual function

app = FastAPI()

def test_some_backend_function():
    # Arrange
    input_data = {...}  # Replace with actual input data
    expected_output = {...}  # Replace with expected output

    # Act
    result = some_backend_function(input_data)

    # Assert
    assert result == expected_output

def test_another_backend_function():
    # Arrange
    input_data = {...}  # Replace with actual input data
    expected_output = {...}  # Replace with expected output

    # Act
    result = some_backend_function(input_data)

    # Assert
    assert result == expected_output