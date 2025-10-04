from fastapi import HTTPException

def example_backend_logic(data: dict) -> dict:
    if "key" not in data:
        raise HTTPException(status_code=400, detail="Missing 'key' in request data")

    # Example processing logic
    result = {"message": f"Received key: {data['key']}"}
    return result

def some_backend_logic_function(input_data=None):
    """
    Example backend logic function that could perform some processing

    Args:
        input_data: Optional input data to process

    Returns:
        dict: Processed results
    """
    if input_data:
        return {"result": f"Processed {input_data}", "status": "success"}
    return {"result": "No input provided", "status": "success"}

def another_backend_function(param1, param2=None):
    """Another example function"""
    result = f"Processed {param1}"
    if param2:
        result += f" with {param2}"
    return {"data": result}
