# Lender Matching Platform - Backend

FastAPI backend for loan underwriting and lender matching.

## Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE lender_match;
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Configure database (optional):
Create `.env` file:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lender_match
```

4. Run server:
```bash
uvicorn main:app --reload
```

5. Open API docs: http://localhost:8000/docs

## Import Lender PDFs

Import from directory (one-time setup):
```bash
curl -X POST "http://localhost:8000/import/directory?directory=c:/Users/aviji/OneDrive/Desktop/PROJ/kaaj/pdfdata"
```

Or upload individual PDFs via `/import/pdf` endpoint.

## API Endpoints

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications` | Create loan application |
| GET | `/applications` | List applications |
| GET | `/applications/{id}` | Get application |
| PUT | `/applications/{id}` | Update application |
| DELETE | `/applications/{id}` | Delete application |
| POST | `/applications/{id}/submit` | Submit for review |

### Lenders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lenders` | Create lender |
| GET | `/lenders` | List lenders |
| GET | `/lenders/{id}` | Get lender with policies |
| PUT | `/lenders/{id}` | Update lender |
| DELETE | `/lenders/{id}` | Delete lender |
| POST | `/lenders/{id}/policies` | Add policy |
| PUT | `/lenders/{id}/policies/{pid}` | Update policy |
| DELETE | `/lenders/{id}/policies/{pid}` | Delete policy |

### Underwriting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/underwrite/{app_id}` | Run matching |
| GET | `/underwrite/{app_id}/status` | Check status |
| GET | `/underwrite/rules/available` | List all rules |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches/{app_id}` | Get all matches |
| GET | `/matches/{app_id}/eligible` | Get eligible only |

### Import
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/import/pdf` | Upload and parse PDF |
| POST | `/import/directory` | Import all PDFs from dir |
| GET | `/import/preview` | Preview PDF extraction |

## Adding New Rules

Add new matching rules in `services/rules.py`:

```python
from services.rules import register_rule

@register_rule("custom_check")
def check_custom(app, policy):
    passed = True
    return passed, "Custom Check", app.value, "required value"
```

## Project Structure

```
backend/
├── main.py              # Entry point
├── config.py            # Settings
├── database.py          # DB connection
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic schemas
├── routers/             # API routes
│   ├── applications.py  # Loan apps CRUD
│   ├── lenders.py       # Lender CRUD
│   ├── underwriting.py  # Matching workflow
│   ├── matches.py       # Results
│   └── imports.py       # PDF import
└── services/
    ├── rules.py         # Extensible rule engine
    ├── validation.py    # Input validation
    └── pdf_parser.py    # PDF extraction
```
