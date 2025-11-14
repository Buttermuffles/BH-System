#!/usr/bin/env python3
"""Chandra OCR client

Usage:
  - Set `CHANDRA_ENDPOINT` and `CHANDRA_API_KEY` (or `CHANDRA_AUTH_HEADER_VALUE`) in environment.
  - Run: `python scripts\chandra_ocr.py --input "path/to/file_or_dir"`

The script uploads files to the provided endpoint and stores results in `ocr_output/` and logs in `ocr_logs/`.
"""
import os
import sys
import argparse
import requests
import json
from pathlib import Path
from datetime import datetime
import logging


def setup_logging(log_dir: Path):
    log_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    logfile = log_dir / f"chandra_ocr_{ts}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(logfile, encoding="utf-8"),
        ],
    )
    return logfile


def build_headers():
    endpoint = os.getenv("CHANDRA_ENDPOINT")
    api_key = os.getenv("CHANDRA_API_KEY")
    auth_header = os.getenv("CHANDRA_AUTH_HEADER", "Authorization")
    auth_value = os.getenv("CHANDRA_AUTH_HEADER_VALUE")

    if not endpoint:
        logging.error("Environment variable CHANDRA_ENDPOINT is required.")
        return None, None

    headers = {"Accept": "application/json"}
    if api_key:
        headers[auth_header] = f"Bearer {api_key}"
    elif auth_value:
        headers[auth_header] = auth_value

    return endpoint, headers


def post_file(endpoint: str, headers: dict, file_path: Path, timeout: int = 60):
    logging.info(f"Uploading {file_path}")
    with file_path.open("rb") as f:
        files = {"file": (file_path.name, f, "application/octet-stream")}
        try:
            resp = requests.post(endpoint, headers=headers, files=files, timeout=timeout)
        except Exception as e:
            logging.exception(f"Request failed for {file_path}: {e}")
            return None, None

    try:
        data = resp.json()
    except Exception:
        data = {"status_code": resp.status_code, "text": resp.text}

    return resp, data


def save_output(output_dir: Path, file_path: Path, response_json):
    output_dir.mkdir(parents=True, exist_ok=True)
    base_name = file_path.stem
    # Save raw response JSON
    resp_file = output_dir / f"{base_name}.response.json"
    with resp_file.open("w", encoding="utf-8") as w:
        json.dump(response_json, w, indent=2, ensure_ascii=False)

    # Try to extract textual result
    text = None
    if isinstance(response_json, dict):
        # Common shapes: {"text": "..."} or {"results": [{"text": "..."}]}
        if "text" in response_json and isinstance(response_json["text"], str):
            text = response_json["text"]
        elif "results" in response_json and isinstance(response_json["results"], list):
            parts = []
            for r in response_json["results"]:
                if isinstance(r, dict) and "text" in r:
                    parts.append(r["text"])
            if parts:
                text = "\n\n".join(parts)

    if text is None:
        # Fallback: dump the JSON as text
        text = json.dumps(response_json, indent=2, ensure_ascii=False)

    text_file = output_dir / f"{base_name}.txt"
    with text_file.open("w", encoding="utf-8") as w:
        w.write(text)

    logging.info(f"Saved outputs: {text_file} and {resp_file}")


def gather_files(input_path: Path):
    if input_path.is_file():
        return [input_path]
    elif input_path.is_dir():
        exts = None  # accept all files; user can filter by extension if desired
        files = [p for p in sorted(input_path.rglob("*")) if p.is_file()]
        return files
    else:
        return []


def main():
    parser = argparse.ArgumentParser(description="Upload files to Chandra OCR endpoint and save results.")
    parser.add_argument("--input", "-i", required=True, help="File or directory to process")
    parser.add_argument("--output", "-o", default="ocr_output", help="Directory to save OCR outputs")
    parser.add_argument("--logs", default="ocr_logs", help="Directory to save logs")
    parser.add_argument("--timeout", type=int, default=60, help="HTTP timeout in seconds")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)
    log_dir = Path(args.logs)

    logfile = setup_logging(log_dir)
    logging.info("Chandra OCR client starting")

    endpoint, headers = build_headers()
    if not endpoint:
        logging.error("CHANDRA_ENDPOINT missing. Set the environment variable and retry.")
        sys.exit(2)

    files = gather_files(input_path)
    if not files:
        logging.error(f"No files found at {input_path}")
        sys.exit(1)

    summary = {"processed": 0, "failed": 0, "files": []}
    for fpath in files:
        resp, data = post_file(endpoint, headers or {}, fpath, timeout=args.timeout)
        entry = {"file": str(fpath), "status": None}
        if resp is None:
            entry["status"] = "request_failed"
            summary["failed"] += 1
        else:
            entry["status_code"] = resp.status_code
            try:
                save_output(output_dir, fpath, data)
                entry["status"] = "ok"
                summary["processed"] += 1
            except Exception as e:
                logging.exception(f"Failed saving output for {fpath}: {e}")
                entry["status"] = "save_failed"
                summary["failed"] += 1

        summary["files"].append(entry)

    # Save summary
    summary_file = output_dir / "summary.json"
    output_dir.mkdir(parents=True, exist_ok=True)
    with summary_file.open("w", encoding="utf-8") as s:
        json.dump(summary, s, indent=2)

    logging.info(f"Done. Processed: {summary['processed']}, Failed: {summary['failed']}. Summary: {summary_file}")
    logging.info(f"Log file: {logfile}")


if __name__ == "__main__":
    main()
