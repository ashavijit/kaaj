# Lender Matching Platform - API Documentation

Base URL: `http://localhost:8000`

---

## Applications

### Create Application
```
POST /applications
Content-Type: application/json
```

**Request Body:** See `samples/application_good.json`

**Response:**
```json
{
  "id": 1,
  "borrower_id": 1,
  "amount": 150000,
  "term_months": 60,
  "equipment_type": "Construction",
  "status": "draft",
  "borrower": { ... }
}
```

### List Applications
```
GET /applications?skip=0&limit=100
```

### Get Application
```
GET /applications/{id}
```

### Update Application
```
PUT /applications/{id}
Content-Type: application/json

{
  "amount": 175000,
  "term_months": 72
}
```

### Delete Application
```
DELETE /applications/{id}
```

### Submit Application
```
POST /applications/{id}/submit
```

---

## Lenders

### Create Lender
```
POST /lenders
Content-Type: application/json
```

**Request Body:** See `samples/lender.json`

### List Lenders
```
GET /lenders
```

### Get Lender
```
GET /lenders/{id}
```

### Update Lender
```
PUT /lenders/{id}
Content-Type: application/json

{
  "is_active": false
}
```

### Delete Lender
```
DELETE /lenders/{id}
```

### Add Policy to Lender
```
POST /lenders/{id}/policies
Content-Type: application/json
```

**Request Body:** See `samples/policy.json`

### Update Policy
```
PUT /lenders/{id}/policies/{policy_id}
Content-Type: application/json

{
  "fico_min": 680,
  "max_amount": 750000
}
```

### Delete Policy
```
DELETE /lenders/{id}/policies/{policy_id}
```

---

## Underwriting

### Run Underwriting
```
POST /underwrite/{application_id}
```

**Response:**
```json
{
  "application_id": 1,
  "status": "completed",
  "total_lenders": 5,
  "eligible_count": 3,
  "matches": [
    {
      "id": 1,
      "lender_id": 1,
      "policy_id": 1,
      "eligible": true,
      "fit_score": 85.5,
      "matched_program": "Standard Program",
      "criteria_met": [
        {"criteria": "FICO Score", "value": 720, "required": ">= 650"}
      ],
      "criteria_failed": [],
      "rejection_reasons": null
    }
  ]
}
```

### Get Underwriting Status
```
GET /underwrite/{application_id}/status
```

### List Available Rules
```
GET /underwrite/rules/available
```

---

## Matches

### Get All Matches
```
GET /matches/{application_id}
```

### Get Eligible Matches Only
```
GET /matches/{application_id}/eligible
```

---

## Import

### Upload PDF
```
POST /import/pdf
Content-Type: multipart/form-data

file: <pdf_file>
```

### Import from Directory
```
POST /import/directory?directory=/path/to/pdfs
```

### Preview PDF Extraction
```
GET /import/preview?pdf_path=/path/to/file.pdf
```

---

## Test Flow

1. Create a lender:
```bash
curl -X POST http://localhost:8000/lenders -H "Content-Type: application/json" -d @samples/lender.json
```

2. Add policy (use lender_id from step 1):
```bash
curl -X POST http://localhost:8000/lenders/1/policies -H "Content-Type: application/json" -d @samples/policy.json
```

3. Create application:
```bash
curl -X POST http://localhost:8000/applications -H "Content-Type: application/json" -d @samples/application_good.json
```

4. Run underwriting (use application_id from step 3):
```bash
curl -X POST http://localhost:8000/underwrite/1
```

5. View matches:
```bash
curl http://localhost:8000/matches/1
```
