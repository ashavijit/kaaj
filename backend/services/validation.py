from pydantic import BaseModel
from typing import Optional, List

class ValidationError(BaseModel):
    field: str
    message: str

class ValidationResult(BaseModel):
    valid: bool
    errors: List[ValidationError]


def validate_application(data: dict) -> ValidationResult:
    errors = []
    
    borrower = data.get("borrower", {})
    
    if not borrower.get("business_name"):
        errors.append(ValidationError(field="borrower.business_name", message="Business name is required"))
    
    if not borrower.get("industry"):
        errors.append(ValidationError(field="borrower.industry", message="Industry is required"))
    
    if not borrower.get("state"):
        errors.append(ValidationError(field="borrower.state", message="State is required"))
    elif len(borrower.get("state", "")) != 2:
        errors.append(ValidationError(field="borrower.state", message="State must be 2-letter code"))
    
    if borrower.get("years_in_business") is None:
        errors.append(ValidationError(field="borrower.years_in_business", message="Years in business is required"))
    elif borrower.get("years_in_business", 0) < 0:
        errors.append(ValidationError(field="borrower.years_in_business", message="Years in business cannot be negative"))
    
    if borrower.get("annual_revenue") is None:
        errors.append(ValidationError(field="borrower.annual_revenue", message="Annual revenue is required"))
    elif borrower.get("annual_revenue", 0) <= 0:
        errors.append(ValidationError(field="borrower.annual_revenue", message="Annual revenue must be positive"))
    
    guarantors = borrower.get("guarantors", [])
    if not guarantors:
        errors.append(ValidationError(field="borrower.guarantors", message="At least one guarantor is required"))
    else:
        for i, g in enumerate(guarantors):
            if not g.get("name"):
                errors.append(ValidationError(field=f"borrower.guarantors[{i}].name", message="Guarantor name is required"))
            if g.get("fico_score") is None:
                errors.append(ValidationError(field=f"borrower.guarantors[{i}].fico_score", message="FICO score is required"))
            elif not (300 <= g.get("fico_score", 0) <= 850):
                errors.append(ValidationError(field=f"borrower.guarantors[{i}].fico_score", message="FICO score must be 300-850"))
    
    if data.get("amount") is None:
        errors.append(ValidationError(field="amount", message="Loan amount is required"))
    elif data.get("amount", 0) <= 0:
        errors.append(ValidationError(field="amount", message="Loan amount must be positive"))
    
    if data.get("term_months") is None:
        errors.append(ValidationError(field="term_months", message="Term is required"))
    elif data.get("term_months", 0) <= 0:
        errors.append(ValidationError(field="term_months", message="Term must be positive"))
    
    if not data.get("equipment_type"):
        errors.append(ValidationError(field="equipment_type", message="Equipment type is required"))
    
    return ValidationResult(valid=len(errors) == 0, errors=errors)
