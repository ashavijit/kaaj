from pydantic import BaseModel
from typing import Optional, List

class GuarantorCreate(BaseModel):
    name: str
    fico_score: int
    has_bankruptcy: int = 0
    has_open_tax_liens: int = 0

class GuarantorResponse(GuarantorCreate):
    id: str
    borrower_id: str
    
    class Config:
        from_attributes = True

class BorrowerCreate(BaseModel):
    business_name: str
    industry: str
    state: str
    years_in_business: int
    annual_revenue: float
    paynet_score: Optional[int] = None
    guarantors: List[GuarantorCreate] = []

class BorrowerResponse(BaseModel):
    id: str
    business_name: str
    industry: str
    state: str
    years_in_business: int
    annual_revenue: float
    paynet_score: Optional[int]
    guarantors: List[GuarantorResponse] = []
    
    class Config:
        from_attributes = True

class LoanApplicationCreate(BaseModel):
    borrower: BorrowerCreate
    amount: float
    term_months: int
    equipment_type: str
    equipment_age_years: int = 0
    equipment_description: Optional[str] = None

class LoanApplicationResponse(BaseModel):
    id: str
    borrower_id: str
    amount: float
    term_months: int
    equipment_type: str
    equipment_age_years: int
    equipment_description: Optional[str]
    status: str
    borrower: BorrowerResponse
    
    class Config:
        from_attributes = True

class LoanApplicationUpdate(BaseModel):
    amount: Optional[float] = None
    term_months: Optional[int] = None
    equipment_type: Optional[str] = None
    equipment_age_years: Optional[int] = None
    equipment_description: Optional[str] = None
