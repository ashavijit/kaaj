from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
import tempfile
from database import get_db
from models import Lender, LenderPolicy
from services.pdf_parser import parse_pdf, parse_all_pdfs

router = APIRouter(prefix="/import", tags=["Import"])

@router.post("/pdf")
async def import_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        data = parse_pdf(tmp_path)
        
        lender = db.query(Lender).filter(Lender.name == data["lender_name"]).first()
        if not lender:
            lender = Lender(name=data["lender_name"], is_active=True)
            db.add(lender)
            db.flush()
        
        policies_created = []
        programs = data.get("programs", [])
        
        if not programs:
            programs = [{"name": "Standard Program"}]
        
        for program in programs:
            policy = LenderPolicy(
                lender_id=lender.id,
                program_name=program.get("name", "Standard Program"),
                fico_min=program.get("fico_min") or data.get("fico_min"),
                paynet_min=program.get("paynet_min") or data.get("paynet_min"),
                min_years_in_business=program.get("min_years_in_business") or data.get("min_years_in_business"),
                min_annual_revenue=data.get("min_annual_revenue"),
                min_amount=data.get("min_amount"),
                max_amount=data.get("max_amount"),
                min_term=data.get("min_term_months"),
                max_term=data.get("max_term_months"),
                max_equipment_age=data.get("max_equipment_age_years"),
                allowed_equipment_types=data.get("allowed_equipment_types"),
                excluded_states=data.get("excluded_states"),
                excluded_industries=data.get("excluded_industries")
            )
            db.add(policy)
            policies_created.append(program.get("name", "Standard Program"))
        
        db.commit()
        
        return {
            "message": "PDF imported successfully",
            "lender": data["lender_name"],
            "policies_created": policies_created,
            "extracted": data
        }
    finally:
        os.unlink(tmp_path)

@router.post("/directory")
def import_from_directory(directory: str, db: Session = Depends(get_db)):
    if not os.path.isdir(directory):
        raise HTTPException(status_code=400, detail="Directory not found")
    
    results = parse_all_pdfs(directory)
    imported = []
    
    for data in results:
        if "error" in data:
            imported.append(data)
            continue
        
        lender = db.query(Lender).filter(Lender.name == data["lender_name"]).first()
        if not lender:
            lender = Lender(name=data["lender_name"], is_active=True)
            db.add(lender)
            db.flush()
        
        programs = data.get("programs", [])
        if not programs:
            programs = [{"name": "Standard Program"}]
        
        policies_created = []
        for program in programs:
            policy = LenderPolicy(
                lender_id=lender.id,
                program_name=program.get("name", "Standard Program"),
                fico_min=program.get("fico_min") or data.get("fico_min"),
                paynet_min=program.get("paynet_min") or data.get("paynet_min"),
                min_years_in_business=program.get("min_years_in_business") or data.get("min_years_in_business"),
                min_annual_revenue=data.get("min_annual_revenue"),
                min_amount=data.get("min_amount"),
                max_amount=data.get("max_amount"),
                min_term=data.get("min_term_months"),
                max_term=data.get("max_term_months"),
                max_equipment_age=data.get("max_equipment_age_years"),
                allowed_equipment_types=data.get("allowed_equipment_types"),
                excluded_states=data.get("excluded_states"),
                excluded_industries=data.get("excluded_industries")
            )
            db.add(policy)
            policies_created.append(program.get("name", "Standard Program"))
        
        imported.append({
            "lender": data["lender_name"],
            "status": "imported",
            "policies": policies_created
        })
    
    db.commit()
    return {"imported": imported, "total": len(imported)}

@router.get("/preview")
def preview_pdf_extraction(pdf_path: str):
    if not os.path.isfile(pdf_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    data = parse_pdf(pdf_path)
    return data
