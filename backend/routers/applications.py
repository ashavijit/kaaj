from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Borrower, Guarantor, LoanApplication, ApplicationStatus
from schemas import LoanApplicationCreate, LoanApplicationResponse, LoanApplicationUpdate
from services.validation import validate_application

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("", response_model=LoanApplicationResponse)
def create_application(data: LoanApplicationCreate, db: Session = Depends(get_db)):
    validation = validate_application(data.model_dump())
    if not validation.valid:
        raise HTTPException(status_code=400, detail={"errors": [e.model_dump() for e in validation.errors]})
    
    borrower = Borrower(
        business_name=data.borrower.business_name,
        industry=data.borrower.industry,
        state=data.borrower.state,
        years_in_business=data.borrower.years_in_business,
        annual_revenue=data.borrower.annual_revenue,
        paynet_score=data.borrower.paynet_score
    )
    db.add(borrower)
    db.flush()
    
    for g in data.borrower.guarantors:
        guarantor = Guarantor(
            borrower_id=borrower.id,
            name=g.name,
            fico_score=g.fico_score,
            has_bankruptcy=g.has_bankruptcy,
            has_open_tax_liens=g.has_open_tax_liens
        )
        db.add(guarantor)
    
    application = LoanApplication(
        borrower_id=borrower.id,
        amount=data.amount,
        term_months=data.term_months,
        equipment_type=data.equipment_type,
        equipment_age_years=data.equipment_age_years,
        equipment_description=data.equipment_description,
        status=ApplicationStatus.DRAFT
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("", response_model=List[LoanApplicationResponse])
def list_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(LoanApplication).offset(skip).limit(limit).all()

@router.get("/{app_id}", response_model=LoanApplicationResponse)
def get_application(app_id: str, db: Session = Depends(get_db)):
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.put("/{app_id}", response_model=LoanApplicationResponse)
def update_application(app_id: str, data: LoanApplicationUpdate, db: Session = Depends(get_db)):
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(app, key, value)
    
    db.commit()
    db.refresh(app)
    return app

@router.delete("/{app_id}")
def delete_application(app_id: str, db: Session = Depends(get_db)):
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(app)
    db.commit()
    return {"message": "Application deleted"}

@router.post("/{app_id}/submit")
def submit_application(app_id: str, db: Session = Depends(get_db)):
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app.status = ApplicationStatus.SUBMITTED
    db.commit()
    return {"message": "Application submitted", "status": app.status.value}
