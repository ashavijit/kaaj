from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import applications_router, lenders_router, underwriting_router, matches_router, imports_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lender Matching Platform",
    description="Loan underwriting and lender matching system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(applications_router)
app.include_router(lenders_router)
app.include_router(underwriting_router)
app.include_router(matches_router)
app.include_router(imports_router)

@app.get("/")
def root():
    return {"message": "Lender Matching Platform API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}
