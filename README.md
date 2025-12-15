# Kaaj

Loan underwriting tool that matches borrowers to lenders based on their requirements.

## What it does

You feed it a loan application (borrower info, equipment details, loan amount, etc.) and it tells you which lenders would approve it. Each match comes with a fit score and shows exactly which criteria passed or failed.

Also parses lender PDFs to extract their requirements automatically.

## Stack

- **Backend**: FastAPI + PostgreSQL
- **Frontend**: Next.js + shadcn/ui

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`

### With Docker

```bash
cd backend
docker-compose up
```

## API

Main endpoints:

- `POST /applications` - create a loan application
- `POST /underwrite/{id}` - run matching against all lenders
- `GET /results/{id}` - get match results
- `POST /lenders/parse-pdf` - upload lender guidelines PDF

Full API docs at `/docs` when running.

## Testing

```bash
cd backend
pytest tests/ -v
```

```
tests/test_matching.py::TestFicoRule::test_fico_pass PASSED
tests/test_matching.py::TestFicoRule::test_fico_fail PASSED
tests/test_matching.py::TestFicoRule::test_fico_no_requirement PASSED
tests/test_matching.py::TestLoanAmountRules::test_min_amount_pass PASSED
tests/test_matching.py::TestLoanAmountRules::test_min_amount_fail PASSED
tests/test_matching.py::TestLoanAmountRules::test_max_amount_pass PASSED
tests/test_matching.py::TestLoanAmountRules::test_max_amount_fail PASSED
tests/test_matching.py::TestStateRules::test_state_allowed PASSED
tests/test_matching.py::TestStateRules::test_state_not_allowed PASSED
tests/test_matching.py::TestStateRules::test_state_excluded PASSED
tests/test_matching.py::TestStateRules::test_state_not_excluded PASSED
tests/test_matching.py::TestIndustryRule::test_industry_allowed PASSED
tests/test_matching.py::TestIndustryRule::test_industry_excluded PASSED
tests/test_matching.py::TestIndustryRule::test_industry_case_insensitive PASSED
tests/test_matching.py::TestRiskFlags::test_no_bankruptcy_pass PASSED
tests/test_matching.py::TestRiskFlags::test_bankruptcy_fail PASSED
tests/test_matching.py::TestRiskFlags::test_no_tax_liens_pass PASSED
tests/test_matching.py::TestRiskFlags::test_tax_liens_fail PASSED
tests/test_matching.py::TestRunAllRules::test_all_pass_eligible PASSED
tests/test_matching.py::TestRunAllRules::test_partial_fail PASSED
tests/test_matching.py::TestRunAllRules::test_score_calculation PASSED

21 passed
```

## Project structure

```
backend/
├── models/      # database models
├── schemas/     # request/response validation
├── routers/     # API endpoints
├── services/    # matching engine, pdf parser, rules
└── utils/       # helpers

frontend/
└── src/
    ├── app/         # pages
    └── components/  # UI components
```

## Decisions

See [DECISIONS.md](./DECISIONS.md) for the reasoning behind major choices.
