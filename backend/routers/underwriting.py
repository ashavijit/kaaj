from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import LoanApplication, Lender, LenderPolicy, MatchResult, ApplicationStatus
from schemas import UnderwritingResponse, MatchResultResponse
from services.rules import run_all_rules, get_available_rules
from services.validation import validate_application

router = APIRouter(prefix="/underwrite", tags=["Underwriting"])

@router.post("/{app_id}", response_model=UnderwritingResponse)
def run_underwriting(app_id: str, db: Session = Depends(get_db)):
    application = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.query(MatchResult).filter(MatchResult.application_id == app_id).delete()
    
    application.status = ApplicationStatus.UNDERWRITING
    db.commit()
    
    lenders = db.query(Lender).filter(Lender.is_active == True).all()
    
    matches = []
    for lender in lenders:
        for policy in lender.policies:
            eligible, score, met, failed, reasons = run_all_rules(application, policy)
            
            match = MatchResult(
                application_id=app_id,
                lender_id=lender.id,
                policy_id=policy.id,
                lender_name=lender.name,
                eligible=eligible,
                fit_score=score,
                matched_program=policy.program_name if eligible else None,
                criteria_met=met,
                criteria_failed=failed,
                rejection_reasons=reasons if not eligible else None
            )
            db.add(match)
            matches.append(match)
    
    application.status = ApplicationStatus.COMPLETED
    db.commit()
    
    for m in matches:
        db.refresh(m)
    
    eligible_count = sum(1 for m in matches if m.eligible)
    
    return UnderwritingResponse(
        application_id=app_id,
        status="completed",
        total_lenders=len(lenders),
        eligible_count=eligible_count,
        matches=[MatchResultResponse.model_validate(m) for m in matches]
    )

@router.get("/{app_id}/status")
def get_underwriting_status(app_id: str, db: Session = Depends(get_db)):
    application = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"application_id": app_id, "status": application.status.value}

@router.get("/rules/available")
def list_available_rules():
    return {"rules": get_available_rules()}
