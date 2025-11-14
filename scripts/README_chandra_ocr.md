# Chandra OCR client (scripts/chandra_ocr.py)

Quick guide to use the Chandra OCR client script added to the repository.

Setup
- Install Python 3.8+ and create a venv if desired.
- Install required package(s):

```powershell
python -m pip install -r scripts/requirements.txt
```

Environment
- Copy `scripts/.env.example` to your environment or export the variables in the shell.
- Required:
  - `CHANDRA_ENDPOINT` — full URL to the OCR endpoint.
  - `CHANDRA_API_KEY` — API key (optional if you set `CHANDRA_AUTH_HEADER_VALUE`).

Windows (cmd.exe) example:
```cmd
set CHANDRA_ENDPOINT=https://api.chandra.example/ocr
set CHANDRA_API_KEY=your_api_key_here
python scripts\chandra_ocr.py --input "storage\app\private" --output ocr_output
```

PowerShell example:
```powershell
$env:CHANDRA_ENDPOINT = 'https://api.chandra.example/ocr'
$env:CHANDRA_API_KEY = 'your_api_key_here'
python scripts/chandra_ocr.py --input "storage/app/private" --output ocr_output
```

Notes
- The script will create `ocr_output/` with `.txt` and `.response.json` files per input file, and `ocr_logs/` with run logs.
- The client tries to extract a `text` field (or `results[*].text`) from the JSON response and falls back to writing the whole JSON.
- If you'd like, supply the endpoint and key here and I can run the script and share the results. Do not paste secrets unless you want me to run a live request.
