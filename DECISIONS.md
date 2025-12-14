# Design Decisions

## Lender Requirements Prioritized

### 1. Core Credit Criteria (Highest Priority)
- **FICO Score** - A personal credit score is the main factor for eligibility in all lenders
- **PayNet Score** - A business credit score that is used by commercial lenders
- **Years in Business** - Time in business requirement (TIB)
- **Loan Amount Range** - Min/max loan amounts per lender

### 2. Business & Collateral Criteria
- **Equipment Type** - Different lenders may focus on different equipment categories
- **Equipment Age** - Maximum age restrictions (e.g., "equipment must be ≤10 years old")
- **Annual Revenue** - Minimum revenue requirements for corp-only programs
- **Geographic Restrictions** - State exclusions (e.g., Apex doesn't lend in CA, NV, ND, VT)

### 3. Risk Flags
- **Bankruptcy History** - Most lenders require no recent bankruptcy
- **Tax Liens** - Open tax liens disqualify from most programs
- **Industry Exclusions** - High-risk industries excluded (gambling, cannabis, etc.)

## Simplifications Made

### 1. Single Primary Guarantor
- **Decision**: For matching purposes, use the primary guarantor's FICO score
- **Reason**: Simplifies matching logic; in reality, systems would consider all guarantors

### 2. Multi-Tier Programs → Separate Policies
- **Decision**: Each program tier (A/B/C Rate, Tier 1/2/3) is converted to a separate `LenderPolicy`
- **Reason**: Enables detailed matching and best-fit program display per lender

### 3. PDF Parsing with Regex
- **Decision**: Switch to pattern matching instead of LLM-based extraction
- **Reason**: It is deterministic, fast, and also works offline; patterns can handle 90% of cases

### 4. Scoring Formula
- **Decision**: Fit score = (criteria met/total criteria) × 100
- **Reason**: It is a straightforward, understandable, and easily comparable score across different lenders

### 5. No Hatchet Workflow Integration
- **Decision**: Synchronous matching in FastAPI endpoint
- **Reason**: 5 lenders × ~15 policies runs in <100ms; parallelization overhead not justified

## Architecture Decisions

### Backend Structure
```
backend/
├── models/ # SQLAlchemy ORM (single source of truth)
├── schemas/ # Pydantic validation (API contracts)
├── routers/ # FastAPI endpoints (thin layer)
├── services/ # Business logic (matching, rules, parsing)
└── utils/ # ID generation, helpers
```

### Rule Engine Design
- **Extensible**: New rules can be added just by decorating the functions with `@register_rule("name")`
- **Decoupled**: Rules are independent of each other; the matching engine runs all rules
- **Transparent**: A rule returns (passed, criteria_name, value, required) that can be displayed in the UI

### PDF Parser Design
- **Class-based**: `PDFParser` is a class that has methods for extracting specific fields
- **Fallback patterns**: There are multiple regex patterns for each field to be more robust
- **Multi-tier aware**: Separate extraction for Tier 1/2/3 and A/B/C rate

## What I Would Add With More Time

### 1. Hatchet Workflow Integration
- Lender evaluation parallel with retry logic
- Status polling async for large batch processing
- Credit bureau call rate limiting

### 2. Enhanced Matching Logic
- Scoring that is weighted (FICO failures are more impactful than term mismatches)
- Close-miss detection (e.g., "FICO 695, needs 700 - consider with conditions")
- Program suggestion ("You are eligible for B Rate, A Rate requires 30 more FICO points")

### 3. PDF Parsing Improvements
- Table extraction with LLM-assisted methods
- Confidence score for each extracted field
- Low confidence extractions go to a human review queue

### 4. Additional UI Features
- Lender comparison side by side
- PDF/Excel export - History and version tracking of applications
- Bulk application upload (CSV)

### 5. Testing
- Unit tests for all rules
- Integration tests for PDF parser
- E2E tests using Playwright
- Load testing for underwriting endpoint

### 6. Production Readiness
- Correlation IDs in structured logging
- Monitoring through Prometheus metrics
- Rate limiting on public endpoints
- Alembic database migrations
- Docker Compose for local development
- GitHub Actions CI/CD pipeline