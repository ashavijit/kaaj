from typing import Callable, Any
from models import LoanApplication, LenderPolicy

RuleFunction = Callable[[LoanApplication, LenderPolicy], tuple[bool, str, Any, Any]]

RULES_REGISTRY: dict[str, RuleFunction] = {}

def register_rule(name: str):
    def decorator(func: RuleFunction):
        RULES_REGISTRY[name] = func
        return func
    return decorator

@register_rule("fico_score")
def check_fico(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.fico_min:
        return True, "FICO Score", None, None
    
    guarantors = app.borrower.guarantors
    if not guarantors:
        return False, "FICO Score", "No guarantor", f">= {policy.fico_min}"
    
    fico = guarantors[0].fico_score
    if fico >= policy.fico_min:
        return True, "FICO Score", fico, f">= {policy.fico_min}"
    return False, "FICO Score", fico, f">= {policy.fico_min}"

@register_rule("paynet_score")
def check_paynet(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.paynet_min:
        return True, "PayNet Score", None, None
    
    score = app.borrower.paynet_score
    if not score:
        return False, "PayNet Score", "Not provided", f">= {policy.paynet_min}"
    
    if score >= policy.paynet_min:
        return True, "PayNet Score", score, f">= {policy.paynet_min}"
    return False, "PayNet Score", score, f">= {policy.paynet_min}"

@register_rule("years_in_business")
def check_years(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.min_years_in_business:
        return True, "Years in Business", None, None
    
    years = app.borrower.years_in_business
    if years >= policy.min_years_in_business:
        return True, "Years in Business", years, f">= {policy.min_years_in_business}"
    return False, "Years in Business", years, f">= {policy.min_years_in_business}"

@register_rule("annual_revenue")
def check_revenue(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.min_annual_revenue:
        return True, "Annual Revenue", None, None
    
    revenue = app.borrower.annual_revenue
    if revenue >= policy.min_annual_revenue:
        return True, "Annual Revenue", f"${revenue:,.0f}", f">= ${policy.min_annual_revenue:,.0f}"
    return False, "Annual Revenue", f"${revenue:,.0f}", f">= ${policy.min_annual_revenue:,.0f}"

@register_rule("loan_amount_min")
def check_min_amount(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.min_amount:
        return True, "Minimum Loan Amount", None, None
    
    amount = app.amount
    if amount >= policy.min_amount:
        return True, "Minimum Loan Amount", f"${amount:,.0f}", f">= ${policy.min_amount:,.0f}"
    return False, "Minimum Loan Amount", f"${amount:,.0f}", f">= ${policy.min_amount:,.0f}"

@register_rule("loan_amount_max")
def check_max_amount(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.max_amount:
        return True, "Maximum Loan Amount", None, None
    
    amount = app.amount
    if amount <= policy.max_amount:
        return True, "Maximum Loan Amount", f"${amount:,.0f}", f"<= ${policy.max_amount:,.0f}"
    return False, "Maximum Loan Amount", f"${amount:,.0f}", f"<= ${policy.max_amount:,.0f}"

@register_rule("term_min")
def check_min_term(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.min_term:
        return True, "Minimum Term", None, None
    
    term = app.term_months
    if term >= policy.min_term:
        return True, "Minimum Term", f"{term} months", f">= {policy.min_term} months"
    return False, "Minimum Term", f"{term} months", f">= {policy.min_term} months"

@register_rule("term_max")
def check_max_term(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.max_term:
        return True, "Maximum Term", None, None
    
    term = app.term_months
    if term <= policy.max_term:
        return True, "Maximum Term", f"{term} months", f"<= {policy.max_term} months"
    return False, "Maximum Term", f"{term} months", f"<= {policy.max_term} months"

@register_rule("equipment_age")
def check_equipment_age(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.max_equipment_age:
        return True, "Equipment Age", None, None
    
    age = app.equipment_age_years
    if age <= policy.max_equipment_age:
        return True, "Equipment Age", f"{age} years", f"<= {policy.max_equipment_age} years"
    return False, "Equipment Age", f"{age} years", f"<= {policy.max_equipment_age} years"

@register_rule("state_allowed")
def check_state(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    state = app.borrower.state
    
    if policy.allowed_states:
        if state in policy.allowed_states:
            return True, "State", state, f"in {policy.allowed_states}"
        return False, "State", state, f"must be in {policy.allowed_states}"
    
    if policy.excluded_states:
        if state not in policy.excluded_states:
            return True, "State", state, f"not in {policy.excluded_states}"
        return False, "State", state, f"excluded: {policy.excluded_states}"
    
    return True, "State", state, "All states allowed"

@register_rule("industry")
def check_industry(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.excluded_industries:
        return True, "Industry", None, None
    
    industry = app.borrower.industry.lower()
    excluded = [i.lower() for i in policy.excluded_industries]
    
    if industry not in excluded:
        return True, "Industry", app.borrower.industry, "Not in excluded list"
    return False, "Industry", app.borrower.industry, f"Excluded: {policy.excluded_industries}"

@register_rule("equipment_type")
def check_equipment_type(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.allowed_equipment_types:
        return True, "Equipment Type", None, None
    
    equip = app.equipment_type.lower()
    allowed = [e.lower() for e in policy.allowed_equipment_types]
    
    if equip in allowed:
        return True, "Equipment Type", app.equipment_type, f"in {policy.allowed_equipment_types}"
    return False, "Equipment Type", app.equipment_type, f"must be in {policy.allowed_equipment_types}"

@register_rule("no_bankruptcy")
def check_bankruptcy(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.no_bankruptcy:
        return True, "Bankruptcy", None, None
    
    guarantors = app.borrower.guarantors
    if not guarantors:
        return True, "Bankruptcy", "No guarantor", None
    
    if guarantors[0].has_bankruptcy == 0:
        return True, "Bankruptcy", "Clear", "No bankruptcy allowed"
    return False, "Bankruptcy", "Has bankruptcy", "No bankruptcy allowed"

@register_rule("no_tax_liens")
def check_tax_liens(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, str, Any, Any]:
    if not policy.no_open_tax_liens:
        return True, "Tax Liens", None, None
    
    guarantors = app.borrower.guarantors
    if not guarantors:
        return True, "Tax Liens", "No guarantor", None
    
    if guarantors[0].has_open_tax_liens == 0:
        return True, "Tax Liens", "Clear", "No open tax liens allowed"
    return False, "Tax Liens", "Has tax liens", "No open tax liens allowed"


def run_all_rules(app: LoanApplication, policy: LenderPolicy) -> tuple[bool, float, list, list, list]:
    criteria_met = []
    criteria_failed = []
    rejection_reasons = []
    
    for rule_name, rule_func in RULES_REGISTRY.items():
        passed, criteria_name, value, required = rule_func(app, policy)
        
        if value is None and required is None:
            continue
        
        if passed:
            criteria_met.append({"criteria": criteria_name, "value": value, "required": required})
        else:
            criteria_failed.append({"criteria": criteria_name, "value": value, "required": required})
            rejection_reasons.append(f"{criteria_name}: {value} does not meet {required}")
    
    eligible = len(criteria_failed) == 0
    total = len(criteria_met) + len(criteria_failed)
    score = (len(criteria_met) / total * 100) if total > 0 else 0
    
    return eligible, score, criteria_met, criteria_failed, rejection_reasons


def get_available_rules() -> list[str]:
    return list(RULES_REGISTRY.keys())
