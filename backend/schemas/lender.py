from pydantic import BaseModel
from typing import Optional, List

class LenderPolicyCreate(BaseModel):
    program_name: str
    fico_min: Optional[int] = None
    fico_max: Optional[int] = None
    paynet_min: Optional[int] = None
    min_years_in_business: Optional[int] = None
    min_annual_revenue: Optional[float] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    min_term: Optional[int] = None
    max_term: Optional[int] = None
    max_equipment_age: Optional[int] = None
    allowed_equipment_types: Optional[List[str]] = None
    allowed_states: Optional[List[str]] = None
    excluded_states: Optional[List[str]] = None
    excluded_industries: Optional[List[str]] = None
    no_bankruptcy: bool = True
    no_open_tax_liens: bool = True

class LenderPolicyResponse(LenderPolicyCreate):
    id: str
    lender_id: str
    
    class Config:
        from_attributes = True

class LenderPolicyUpdate(BaseModel):
    program_name: Optional[str] = None
    fico_min: Optional[int] = None
    fico_max: Optional[int] = None
    paynet_min: Optional[int] = None
    min_years_in_business: Optional[int] = None
    min_annual_revenue: Optional[float] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    min_term: Optional[int] = None
    max_term: Optional[int] = None
    max_equipment_age: Optional[int] = None
    allowed_equipment_types: Optional[List[str]] = None
    allowed_states: Optional[List[str]] = None
    excluded_states: Optional[List[str]] = None
    excluded_industries: Optional[List[str]] = None
    no_bankruptcy: Optional[bool] = None
    no_open_tax_liens: Optional[bool] = None

class LenderCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class LenderResponse(LenderCreate):
    id: str
    policies: List[LenderPolicyResponse] = []
    
    class Config:
        from_attributes = True

class LenderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
