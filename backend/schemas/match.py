from pydantic import BaseModel
from typing import Optional, List

class CriteriaDetail(BaseModel):
    criteria: str
    passed: bool
    reason: str

class MatchResultResponse(BaseModel):
    id: str
    application_id: str
    lender_id: str
    policy_id: str
    lender_name: Optional[str]
    eligible: bool
    fit_score: float
    matched_program: Optional[str]
    criteria_met: Optional[List[dict]]
    criteria_failed: Optional[List[dict]]
    rejection_reasons: Optional[List[str]]
    
    class Config:
        from_attributes = True

class UnderwritingResponse(BaseModel):
    application_id: str
    status: str
    total_lenders: int
    eligible_count: int
    matches: List[MatchResultResponse]
