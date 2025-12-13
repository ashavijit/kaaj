from models import LoanApplication, LenderPolicy

def evaluate_policy(application: LoanApplication, policy: LenderPolicy):
    """Evaluate an application against a lender policy. Returns (eligible, score, met, failed, reasons)."""
    
    borrower = application.borrower
    guarantors = borrower.guarantors
    primary_guarantor = guarantors[0] if guarantors else None
    
    criteria_met = []
    criteria_failed = []
    rejection_reasons = []
    
    # FICO Score Check
    if policy.fico_min and primary_guarantor:
        if primary_guarantor.fico_score >= policy.fico_min:
            criteria_met.append({"criteria": "FICO Score", "value": primary_guarantor.fico_score, "required": f">= {policy.fico_min}"})
        else:
            criteria_failed.append({"criteria": "FICO Score", "value": primary_guarantor.fico_score, "required": f">= {policy.fico_min}"})
            rejection_reasons.append(f"FICO score {primary_guarantor.fico_score} below minimum {policy.fico_min}")
    
    # PayNet Score Check
    if policy.paynet_min and borrower.paynet_score:
        if borrower.paynet_score >= policy.paynet_min:
            criteria_met.append({"criteria": "PayNet Score", "value": borrower.paynet_score, "required": f">= {policy.paynet_min}"})
        else:
            criteria_failed.append({"criteria": "PayNet Score", "value": borrower.paynet_score, "required": f">= {policy.paynet_min}"})
            rejection_reasons.append(f"PayNet score {borrower.paynet_score} below minimum {policy.paynet_min}")
    
    # Years in Business Check
    if policy.min_years_in_business:
        if borrower.years_in_business >= policy.min_years_in_business:
            criteria_met.append({"criteria": "Years in Business", "value": borrower.years_in_business, "required": f">= {policy.min_years_in_business}"})
        else:
            criteria_failed.append({"criteria": "Years in Business", "value": borrower.years_in_business, "required": f">= {policy.min_years_in_business}"})
            rejection_reasons.append(f"Time in business {borrower.years_in_business}y below minimum {policy.min_years_in_business}y")
    
    # Annual Revenue Check
    if policy.min_annual_revenue:
        if borrower.annual_revenue >= policy.min_annual_revenue:
            criteria_met.append({"criteria": "Annual Revenue", "value": borrower.annual_revenue, "required": f">= ${policy.min_annual_revenue:,.0f}"})
        else:
            criteria_failed.append({"criteria": "Annual Revenue", "value": borrower.annual_revenue, "required": f">= ${policy.min_annual_revenue:,.0f}"})
            rejection_reasons.append(f"Annual revenue ${borrower.annual_revenue:,.0f} below minimum ${policy.min_annual_revenue:,.0f}")
    
    # Loan Amount Check
    if policy.min_amount:
        if application.amount >= policy.min_amount:
            criteria_met.append({"criteria": "Minimum Loan Amount", "value": application.amount, "required": f">= ${policy.min_amount:,.0f}"})
        else:
            criteria_failed.append({"criteria": "Minimum Loan Amount", "value": application.amount, "required": f">= ${policy.min_amount:,.0f}"})
            rejection_reasons.append(f"Loan amount ${application.amount:,.0f} below minimum ${policy.min_amount:,.0f}")
    
    if policy.max_amount:
        if application.amount <= policy.max_amount:
            criteria_met.append({"criteria": "Maximum Loan Amount", "value": application.amount, "required": f"<= ${policy.max_amount:,.0f}"})
        else:
            criteria_failed.append({"criteria": "Maximum Loan Amount", "value": application.amount, "required": f"<= ${policy.max_amount:,.0f}"})
            rejection_reasons.append(f"Loan amount ${application.amount:,.0f} exceeds maximum ${policy.max_amount:,.0f}")
    
    # Term Check
    if policy.min_term:
        if application.term_months >= policy.min_term:
            criteria_met.append({"criteria": "Minimum Term", "value": application.term_months, "required": f">= {policy.min_term} months"})
        else:
            criteria_failed.append({"criteria": "Minimum Term", "value": application.term_months, "required": f">= {policy.min_term} months"})
            rejection_reasons.append(f"Term {application.term_months} months below minimum {policy.min_term} months")
    
    if policy.max_term:
        if application.term_months <= policy.max_term:
            criteria_met.append({"criteria": "Maximum Term", "value": application.term_months, "required": f"<= {policy.max_term} months"})
        else:
            criteria_failed.append({"criteria": "Maximum Term", "value": application.term_months, "required": f"<= {policy.max_term} months"})
            rejection_reasons.append(f"Term {application.term_months} months exceeds maximum {policy.max_term} months")
    
    # Equipment Age Check
    if policy.max_equipment_age:
        if application.equipment_age_years <= policy.max_equipment_age:
            criteria_met.append({"criteria": "Equipment Age", "value": application.equipment_age_years, "required": f"<= {policy.max_equipment_age} years"})
        else:
            criteria_failed.append({"criteria": "Equipment Age", "value": application.equipment_age_years, "required": f"<= {policy.max_equipment_age} years"})
            rejection_reasons.append(f"Equipment age {application.equipment_age_years}y exceeds maximum {policy.max_equipment_age}y")
    
    # State Check
    if policy.allowed_states:
        if borrower.state in policy.allowed_states:
            criteria_met.append({"criteria": "State", "value": borrower.state, "required": f"in {policy.allowed_states}"})
        else:
            criteria_failed.append({"criteria": "State", "value": borrower.state, "required": f"in {policy.allowed_states}"})
            rejection_reasons.append(f"State {borrower.state} not in allowed states")
    
    if policy.excluded_states:
        if borrower.state not in policy.excluded_states:
            criteria_met.append({"criteria": "Excluded States", "value": borrower.state, "required": f"not in {policy.excluded_states}"})
        else:
            criteria_failed.append({"criteria": "Excluded States", "value": borrower.state, "required": f"not in {policy.excluded_states}"})
            rejection_reasons.append(f"State {borrower.state} is excluded")
    
    # Industry Check
    if policy.excluded_industries:
        industry_lower = borrower.industry.lower()
        excluded_lower = [i.lower() for i in policy.excluded_industries]
        if industry_lower not in excluded_lower:
            criteria_met.append({"criteria": "Industry", "value": borrower.industry, "required": f"not in excluded list"})
        else:
            criteria_failed.append({"criteria": "Industry", "value": borrower.industry, "required": f"not in excluded list"})
            rejection_reasons.append(f"Industry {borrower.industry} is excluded")
    
    # Equipment Type Check
    if policy.allowed_equipment_types:
        equip_lower = application.equipment_type.lower()
        allowed_lower = [e.lower() for e in policy.allowed_equipment_types]
        if equip_lower in allowed_lower:
            criteria_met.append({"criteria": "Equipment Type", "value": application.equipment_type, "required": f"in {policy.allowed_equipment_types}"})
        else:
            criteria_failed.append({"criteria": "Equipment Type", "value": application.equipment_type, "required": f"in {policy.allowed_equipment_types}"})
            rejection_reasons.append(f"Equipment type {application.equipment_type} not allowed")
    
    # Bankruptcy Check
    if policy.no_bankruptcy and primary_guarantor:
        if primary_guarantor.has_bankruptcy == 0:
            criteria_met.append({"criteria": "No Bankruptcy", "value": "Clear", "required": "No bankruptcy"})
        else:
            criteria_failed.append({"criteria": "No Bankruptcy", "value": "Has bankruptcy", "required": "No bankruptcy"})
            rejection_reasons.append("Guarantor has bankruptcy on record")
    
    # Tax Liens Check
    if policy.no_open_tax_liens and primary_guarantor:
        if primary_guarantor.has_open_tax_liens == 0:
            criteria_met.append({"criteria": "No Tax Liens", "value": "Clear", "required": "No open tax liens"})
        else:
            criteria_failed.append({"criteria": "No Tax Liens", "value": "Has tax liens", "required": "No open tax liens"})
            rejection_reasons.append("Guarantor has open tax liens")
    
    # Calculate eligibility and score
    eligible = len(criteria_failed) == 0
    total_criteria = len(criteria_met) + len(criteria_failed)
    fit_score = (len(criteria_met) / total_criteria * 100) if total_criteria > 0 else 0
    
    return eligible, fit_score, criteria_met, criteria_failed, rejection_reasons
