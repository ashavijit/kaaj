# Design Decisions

## Lender Requirements Prioritized

### 1. Core Credit Criteria (Highest Priority)
- **FICO Score** - Personal credit score is the primary eligibility filter for all lenders
- **PayNet Score** - Business credit score used by commercial lenders
- **Years in Business** - Time in business requirement (TIB)
- **Loan Amount Range** - Min/max loan amounts per lender

### 2. Business & Collateral Criteria
- **Equipment Type** - Different lenders specialize in different equipment categories
- **Equipment Age** - Max age restrictions (e.g., "equipment must be ≤10 years old")
- **Annual Revenue** - Minimum revenue requirements for corp-only programs
- **Geographic Restrictions** - State exclusions (e.g., Apex doesn't lend in CA, NV, ND, VT)

### 3. Risk Flags
- **Bankruptcy History** - Most lenders require no recent bankruptcy
- **Tax Liens** - Open tax liens disqualify from most programs
- **Industry Exclusions** - High-risk industries excluded (gambling, cannabis, etc.)

## Simplifications Made

### 1. Single Primary Guarantor
- **Decision**: Use the first guarantor's FICO score for matching
- **Reason**: Simplifies matching logic; real systems would evaluate all guarantors

### 2. Multi-Tier Programs → Separate Policies
- **Decision**: Each program tier (A/B/C Rate, Tier 1/2/3) becomes a separate `LenderPolicy`
- **Reason**: Allows granular matching and shows best-fit program per lender

### 3. PDF Parsing with Regex
- **Decision**: Use pattern matching instead of LLM-based extraction
- **Reason**: Deterministic, fast, and works offline; patterns cover 90% of cases

### 4. Scoring Formula
- **Decision**: Fit score = (criteria_met / total_criteria) × 100
- **Reason**: Simple, intuitive, comparable across lenders

### 5. No Hatchet Workflow Integration
- **Decision**: Synchronous matching in FastAPI endpoint
- **Reason**: 5 lenders × ~15 policies runs in <100ms; parallelization overhead not justified

## Architecture Decisions

### Backend Structure
```
backend/
├── models/          # SQLAlchemy ORM (single source of truth)
├── schemas/         # Pydantic validation (API contracts)
├── routers/         # FastAPI endpoints (thin layer)
├── services/        # Business logic (matching, rules, parsing)
└── utils/           # ID generation, helpers
```

### Rule Engine Design
- **Extensible**: Add new rules by decorating functions with `@register_rule("name")`
- **Decoupled**: Rules don't know about each other; matching engine runs all rules
- **Transparent**: Each rule returns (passed, criteria_name, value, required) for UI display

### PDF Parser Design
- **Class-based**: `PDFParser` extracts specific fields via methods
- **Fallback patterns**: Multiple regex patterns per field for robustness
- **Multi-tier aware**: Extracts Tier 1/2/3 and A/B/C rate data separately

## What I Would Add With More Time

### 1. Hatchet Workflow Integration
- Parallel lender evaluation with retry logic
- Async status polling for large batch processing
- Rate limiting for external credit bureau calls

### 2. Enhanced Matching Logic
- Weighted scoring (FICO failures more impactful than term mismatches)
- "Near-miss" detection (e.g., "FICO 695, needs 700 - consider with conditions")
- Program recommendation ("You qualify for B Rate, A Rate requires 30 more FICO points")

### 3. PDF Parsing Improvements
- LLM-assisted extraction for complex tables
- Confidence scores per extracted field
- Human review queue for low-confidence extractions

### 4. Additional UI Features
- Side-by-side lender comparison
- Export to PDF/Excel
- Application history and version tracking
- Bulk application upload (CSV)

### 5. Testing
- Unit tests for all rules
- Integration tests for PDF parser
- E2E tests with Playwright
- Load testing for underwriting endpoint

### 6. Production Readiness
- Structured logging with correlation IDs
- Prometheus metrics for monitoring
- Rate limiting on public endpoints
- Database migrations with Alembic
- Docker Compose for local development
- CI/CD pipeline with GitHub Actions
