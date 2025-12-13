from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import MatchResult, LoanApplication
from schemas import MatchResultResponse

router = APIRouter(prefix="/matches", tags=["Matches"])

@router.get("/{app_id}", response_model=List[MatchResultResponse])
def get_matches(app_id: str, db: Session = Depends(get_db)):
    application = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    matches = db.query(MatchResult).filter(MatchResult.application_id == app_id).order_by(MatchResult.fit_score.desc()).all()
    return matches

@router.get("/{app_id}/eligible", response_model=List[MatchResultResponse])
def get_eligible_matches(app_id: str, db: Session = Depends(get_db)):
    matches = db.query(MatchResult).filter(
        MatchResult.application_id == app_id,
        MatchResult.eligible == True
    ).order_by(MatchResult.fit_score.desc()).all()
    return matches
