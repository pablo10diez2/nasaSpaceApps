from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from bson.errors import InvalidId
from app.routers import modules, datacenter_spec, datacenter_styles, datacenters, placed_modules, positions

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}

# Add this to handle InvalidId exceptions with English error messages
@app.exception_handler(InvalidId)
async def invalid_id_exception_handler(request: Request, exc: InvalidId):
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid ID format"},
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(modules.router)
app.include_router(datacenter_spec.router)
app.include_router(datacenter_styles.router)
app.include_router(datacenters.router)
app.include_router(placed_modules.router)
app.include_router(positions.router)
