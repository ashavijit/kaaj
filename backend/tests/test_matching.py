import pytest
from unittest.mock import MagicMock


def make_guarantor(fico=720, bankruptcy=0, tax_liens=0):
    g = MagicMock()
    g.fico_score = fico
    g.has_bankruptcy = bankruptcy
    g.has_open_tax_liens = tax_liens
    return g


def make_borrower(years=5, revenue=500000, state="TX", industry="Construction", paynet=700, guarantors=None):
    b = MagicMock()
    b.years_in_business = years
    b.annual_revenue = revenue
    b.state = state
    b.industry = industry
    b.paynet_score = paynet
    b.guarantors = guarantors or [make_guarantor()]
    return b


def make_application(amount=100000, term=36, equipment_type="Excavator", equipment_age=2, borrower=None):
    app = MagicMock()
    app.amount = amount
    app.term_months = term
    app.equipment_type = equipment_type
    app.equipment_age_years = equipment_age
    app.borrower = borrower or make_borrower()
    return app


def make_policy(**kwargs):
    p = MagicMock()
    p.fico_min = kwargs.get('fico_min')
    p.paynet_min = kwargs.get('paynet_min')
    p.min_years_in_business = kwargs.get('min_years')
    p.min_annual_revenue = kwargs.get('min_revenue')
    p.min_amount = kwargs.get('min_amount')
    p.max_amount = kwargs.get('max_amount')
    p.min_term = kwargs.get('min_term')
    p.max_term = kwargs.get('max_term')
    p.max_equipment_age = kwargs.get('max_equipment_age')
    p.allowed_states = kwargs.get('allowed_states')
    p.excluded_states = kwargs.get('excluded_states')
    p.excluded_industries = kwargs.get('excluded_industries')
    p.allowed_equipment_types = kwargs.get('allowed_equipment_types')
    p.no_bankruptcy = kwargs.get('no_bankruptcy', False)
    p.no_open_tax_liens = kwargs.get('no_tax_liens', False)
    return p


def check_fico(app, policy):
    if not policy.fico_min:
        return True, "FICO Score", None, None
    guarantors = app.borrower.guarantors
    if not guarantors:
        return False, "FICO Score", "No guarantor", f">= {policy.fico_min}"
    fico = guarantors[0].fico_score
    if fico >= policy.fico_min:
        return True, "FICO Score", fico, f">= {policy.fico_min}"
    return False, "FICO Score", fico, f">= {policy.fico_min}"


def check_min_amount(app, policy):
    if not policy.min_amount:
        return True, "Minimum Loan Amount", None, None
    if app.amount >= policy.min_amount:
        return True, "Minimum Loan Amount", app.amount, f">= {policy.min_amount}"
    return False, "Minimum Loan Amount", app.amount, f">= {policy.min_amount}"


def check_max_amount(app, policy):
    if not policy.max_amount:
        return True, "Maximum Loan Amount", None, None
    if app.amount <= policy.max_amount:
        return True, "Maximum Loan Amount", app.amount, f"<= {policy.max_amount}"
    return False, "Maximum Loan Amount", app.amount, f"<= {policy.max_amount}"


def check_state(app, policy):
    state = app.borrower.state
    if policy.allowed_states:
        if state in policy.allowed_states:
            return True, "State", state, f"in {policy.allowed_states}"
        return False, "State", state, f"must be in {policy.allowed_states}"
    if policy.excluded_states:
        if state not in policy.excluded_states:
            return True, "State", state, f"not in {policy.excluded_states}"
        return False, "State", state, f"excluded: {policy.excluded_states}"
    return True, "State", None, None


def check_industry(app, policy):
    if not policy.excluded_industries:
        return True, "Industry", None, None
    industry = app.borrower.industry.lower()
    excluded = [i.lower() for i in policy.excluded_industries]
    if industry not in excluded:
        return True, "Industry", app.borrower.industry, "Not in excluded list"
    return False, "Industry", app.borrower.industry, f"Excluded: {policy.excluded_industries}"


def check_bankruptcy(app, policy):
    if not policy.no_bankruptcy:
        return True, "Bankruptcy", None, None
    guarantors = app.borrower.guarantors
    if not guarantors:
        return True, "Bankruptcy", "No guarantor", None
    if guarantors[0].has_bankruptcy == 0:
        return True, "Bankruptcy", "Clear", "No bankruptcy allowed"
    return False, "Bankruptcy", "Has bankruptcy", "No bankruptcy allowed"


def check_tax_liens(app, policy):
    if not policy.no_open_tax_liens:
        return True, "Tax Liens", None, None
    guarantors = app.borrower.guarantors
    if not guarantors:
        return True, "Tax Liens", "No guarantor", None
    if guarantors[0].has_open_tax_liens == 0:
        return True, "Tax Liens", "Clear", "No open tax liens allowed"
    return False, "Tax Liens", "Has tax liens", "No open tax liens allowed"


def check_years(app, policy):
    if not policy.min_years_in_business:
        return True, "Years in Business", None, None
    years = app.borrower.years_in_business
    if years >= policy.min_years_in_business:
        return True, "Years in Business", years, f">= {policy.min_years_in_business}"
    return False, "Years in Business", years, f">= {policy.min_years_in_business}"


RULES = [check_fico, check_min_amount, check_max_amount, check_state, check_industry, check_bankruptcy, check_tax_liens, check_years]


def run_all_rules(app, policy):
    criteria_met = []
    criteria_failed = []
    rejection_reasons = []
    for rule_func in RULES:
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


class TestFicoRule:
    def test_fico_pass(self):
        app = make_application(borrower=make_borrower(guarantors=[make_guarantor(fico=750)]))
        policy = make_policy(fico_min=700)
        passed, name, value, _ = check_fico(app, policy)
        assert passed is True
        assert name == "FICO Score"
        assert value == 750

    def test_fico_fail(self):
        app = make_application(borrower=make_borrower(guarantors=[make_guarantor(fico=650)]))
        policy = make_policy(fico_min=700)
        passed, _, value, _ = check_fico(app, policy)
        assert passed is False
        assert value == 650

    def test_fico_no_requirement(self):
        app = make_application()
        policy = make_policy(fico_min=None)
        passed, _, value, _ = check_fico(app, policy)
        assert passed is True
        assert value is None



class TestLoanAmountRules:
    def test_min_amount_pass(self):
        app = make_application(amount=50000)
        policy = make_policy(min_amount=25000)
        passed, *_ = check_min_amount(app, policy)
        assert passed is True

    def test_min_amount_fail(self):
        app = make_application(amount=10000)
        policy = make_policy(min_amount=25000)
        passed, *_ = check_min_amount(app, policy)
        assert passed is False

    def test_max_amount_pass(self):
        app = make_application(amount=100000)
        policy = make_policy(max_amount=500000)
        passed, *_ = check_max_amount(app, policy)
        assert passed is True

    def test_max_amount_fail(self):
        app = make_application(amount=600000)
        policy = make_policy(max_amount=500000)
        passed, *_ = check_max_amount(app, policy)
        assert passed is False


class TestStateRules:
    def test_state_allowed(self):
        app = make_application(borrower=make_borrower(state="TX"))
        policy = make_policy(allowed_states=["TX", "CA", "NY"])
        passed, *_ = check_state(app, policy)
        assert passed is True

    def test_state_not_allowed(self):
        app = make_application(borrower=make_borrower(state="FL"))
        policy = make_policy(allowed_states=["TX", "CA", "NY"])
        passed, *_ = check_state(app, policy)
        assert passed is False

    def test_state_excluded(self):
        app = make_application(borrower=make_borrower(state="CA"))
        policy = make_policy(excluded_states=["CA", "NV"])
        passed, *_ = check_state(app, policy)
        assert passed is False

    def test_state_not_excluded(self):
        app = make_application(borrower=make_borrower(state="TX"))
        policy = make_policy(excluded_states=["CA", "NV"])
        passed, *_ = check_state(app, policy)
        assert passed is True


class TestIndustryRule:
    def test_industry_allowed(self):
        app = make_application(borrower=make_borrower(industry="Construction"))
        policy = make_policy(excluded_industries=["Gambling", "Cannabis"])
        passed, *_ = check_industry(app, policy)
        assert passed is True

    def test_industry_excluded(self):
        app = make_application(borrower=make_borrower(industry="Gambling"))
        policy = make_policy(excluded_industries=["Gambling", "Cannabis"])
        passed, *_ = check_industry(app, policy)
        assert passed is False

    def test_industry_case_insensitive(self):
        app = make_application(borrower=make_borrower(industry="GAMBLING"))
        policy = make_policy(excluded_industries=["gambling", "Cannabis"])
        passed, *_ = check_industry(app, policy)
        assert passed is False


class TestRiskFlags:
    def test_no_bankruptcy_pass(self):
        app = make_application(borrower=make_borrower(guarantors=[make_guarantor(bankruptcy=0)]))
        policy = make_policy(no_bankruptcy=True)
        passed, *_ = check_bankruptcy(app, policy)
        assert passed is True

    def test_bankruptcy_fail(self):
        app = make_application(borrower=make_borrower(guarantors=[make_guarantor(bankruptcy=1)]))
        policy = make_policy(no_bankruptcy=True)
        passed, *_ = check_bankruptcy(app, policy)
        assert passed is False

    def test_no_tax_liens_pass(self):
        app = make_application(borrower=make_borrower(guarantors=[make_guarantor(tax_liens=0)]))
        policy = make_policy(no_tax_liens=True)
        passed, *_ = check_tax_liens(app, policy)
        assert passed is True

    def test_tax_liens_fail(self):
        app = make_application(borrower=make_borrower(guarantors=[make_guarantor(tax_liens=1)]))
        policy = make_policy(no_tax_liens=True)
        passed, *_ = check_tax_liens(app, policy)
        assert passed is False


class TestRunAllRules:
    def test_all_pass_eligible(self):
        app = make_application(
            amount=100000,
            borrower=make_borrower(
                years=5,
                state="TX",
                industry="Construction",
                guarantors=[make_guarantor(fico=750, bankruptcy=0, tax_liens=0)]
            )
        )
        policy = make_policy(fico_min=700, min_years=2, min_amount=50000, max_amount=500000, no_bankruptcy=True, no_tax_liens=True)
        eligible, score, met, failed, reasons = run_all_rules(app, policy)
        assert eligible is True
        assert score == 100.0
        assert len(failed) == 0

    def test_partial_fail(self):
        app = make_application(amount=100000, borrower=make_borrower(years=1, guarantors=[make_guarantor(fico=650)]))
        policy = make_policy(fico_min=700, min_years=2)
        eligible, score, met, failed, reasons = run_all_rules(app, policy)
        assert eligible is False
        assert len(failed) >= 2

    def test_score_calculation(self):
        app = make_application(amount=100000, borrower=make_borrower(years=5, guarantors=[make_guarantor(fico=650)]))
        policy = make_policy(fico_min=700, min_years=2)
        eligible, score, met, failed, reasons = run_all_rules(app, policy)
        assert eligible is False
        assert len(failed) >= 1
        assert score < 100.0
