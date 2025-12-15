# Design Decisions

## What matters most to lenders

### Credit stuff (the dealbreakers)
- **FICO Score** - basically the gatekeeper for every lender
- **PayNet Score** - business credit, some commercial lenders care about this
- **Time in Business** - "how long have you been around?"
- **Loan Amount** - each lender has their min/max sweet spot

### Business & collateral
- **Equipment Type** - some lenders specialize, others don't care
- **Equipment Age** - usually something like "no older than 10 years"
- **Annual Revenue** - for corp-only programs
- **Geography** - Apex won't touch CA, NV, ND, VT for example

### Red flags
- **Recent bankruptcy** - pretty much an instant no
- **Open tax liens** - same deal
- **Certain industries** - gambling, cannabis, etc

---

## Shortcuts I took

### One guarantor only
Using the primary guarantor's FICO for matching. In a real system you'd look at all of them, but this keeps things simple.

### Tiers = separate policies
Each tier (A/B/C rate, Tier 1/2/3) becomes its own `LenderPolicy`. More policies to match against, but way easier to show "here's the best program for you."

### Regex over LLMs for PDFs
Went with pattern matching instead of throwing GPT at it. Deterministic, fast, works offline. Handles most cases fine.

### Dead simple scoring
`fit score = (criteria passed / total criteria) × 100`
Nothing fancy. Easy to understand, easy to compare.

### No async workflows
Considered Hatchet for parallel lender evaluation but... 5 lenders × ~15 policies runs in under 100ms. Overkill.

---

## How it's organized

```
backend/
├── models/      # SQLAlchemy - the truth
├── schemas/     # Pydantic - API contracts
├── routers/     # FastAPI - thin, just routes
├── services/    # where the actual logic lives
└── utils/       # random helpers, ID gen
```

### Rules engine
- Add new rules with `@register_rule("name")`
- Rules don't know about each other
- Each rule returns `(passed, criteria_name, value, required)` - makes it easy to show what failed and why

### PDF parser
- Class-based, methods for each field type
- Multiple regex patterns per field (fallbacks)
- Handles multi-tier docs (Tier 1/2/3, A/B/C rate)

---

## If I had more time

### Async with Hatchet
- Parallel lender evaluation with retries
- Polling for batch jobs
- Rate limit credit bureau calls

### Smarter matching
- Weighted scores (FICO failure > term mismatch)
- "Close miss" detection ("FICO 695, needs 700 - maybe with conditions?")
- Upgrade suggestions ("You qualify for B Rate, need 30 more points for A")

### Better PDF parsing
- LLM for table extraction
- Confidence scores per field
- Route low-confidence stuff to human review

### UI stuff
- Side-by-side lender comparison
- PDF/Excel export
- Application history
- Bulk CSV upload

### Testing (yeah I know)
- Unit tests for rules
- Integration tests for parser
- Playwright E2E
- Load testing the underwriting endpoint

### Prod-ready things
- Structured logging with correlation IDs
- Prometheus metrics
- Rate limiting
- Alembic migrations
- Docker Compose
- CI/CD with GitHub Actions