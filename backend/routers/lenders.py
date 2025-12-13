from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Lender, LenderPolicy
from schemas import (
    LenderCreate, LenderResponse, LenderUpdate,
    LenderPolicyCreate, LenderPolicyResponse, LenderPolicyUpdate
)

router = APIRouter(prefix="/lenders", tags=["Lenders"])

@router.post("", response_model=LenderResponse)
def create_lender(data: LenderCreate, db: Session = Depends(get_db)):
    lender = Lender(**data.model_dump())
    db.add(lender)
    db.commit()
    db.refresh(lender)
    return lender

@router.get("", response_model=List[LenderResponse])
def list_lenders(db: Session = Depends(get_db)):
    return db.query(Lender).all()

@router.get("/{lender_id}", response_model=LenderResponse)
def get_lender(lender_id: str, db: Session = Depends(get_db)):
    lender = db.query(Lender).filter(Lender.id == lender_id).first()
    if not lender:
        raise HTTPException(status_code=404, detail="Lender not found")
    return lender

@router.put("/{lender_id}", response_model=LenderResponse)
def update_lender(lender_id: str, data: LenderUpdate, db: Session = Depends(get_db)):
    lender = db.query(Lender).filter(Lender.id == lender_id).first()
    if not lender:
        raise HTTPException(status_code=404, detail="Lender not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lender, key, value)
    
    db.commit()
    db.refresh(lender)
    return lender

@router.delete("/{lender_id}")
def delete_lender(lender_id: str, db: Session = Depends(get_db)):
    lender = db.query(Lender).filter(Lender.id == lender_id).first()
    if not lender:
        raise HTTPException(status_code=404, detail="Lender not found")
    
    db.delete(lender)
    db.commit()
    return {"message": "Lender deleted"}

@router.post("/{lender_id}/policies", response_model=LenderPolicyResponse)
def create_policy(lender_id: str, data: LenderPolicyCreate, db: Session = Depends(get_db)):
    lender = db.query(Lender).filter(Lender.id == lender_id).first()
    if not lender:
        raise HTTPException(status_code=404, detail="Lender not found")
    
    policy = LenderPolicy(lender_id=lender_id, **data.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.put("/{lender_id}/policies/{policy_id}", response_model=LenderPolicyResponse)
def update_policy(lender_id: str, policy_id: str, data: LenderPolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(LenderPolicy).filter(
        LenderPolicy.id == policy_id,
        LenderPolicy.lender_id == lender_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(policy, key, value)
    
    db.commit()
    db.refresh(policy)
    return policy

@router.delete("/{lender_id}/policies/{policy_id}")
def delete_policy(lender_id: str, policy_id: str, db: Session = Depends(get_db)):
    policy = db.query(LenderPolicy).filter(
        LenderPolicy.id == policy_id,
        LenderPolicy.lender_id == lender_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted"}
