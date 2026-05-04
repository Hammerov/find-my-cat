# Python MVP (No npm required)

This directory contains a Python-only MVP for:
- Anonymous lost/found reports
- Blurred approximate map location
- One photo per report

## Run locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open [http://localhost:8000](http://localhost:8000).

## API

- `GET /api/health`
- `GET /api/reports`
- `POST /api/reports` (multipart form: `status`, `title`, `description`, `lat`, `lng`, `photo`)

## Notes

- Uploaded photos are stored in `backend/uploads/`.
- Data is stored in sqlite at `backend/data/reports.db`.
- Location is intentionally rounded to 2 decimal places before storage.
