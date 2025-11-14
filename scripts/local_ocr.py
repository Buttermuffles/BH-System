#!/usr/bin/env python3
"""Lightweight local OCR fallback using Tesseract via pytesseract.

This script processes a file or directory and writes plain-text outputs
to the `ocr_output/` directory. It requires the Tesseract engine installed
on the system and the Python packages `pytesseract` and `Pillow`.
"""
import argparse
import sys
import os
from pathlib import Path
import logging
from datetime import datetime
from dotenv import load_dotenv

try:
    from PIL import Image
    import pytesseract
except Exception as e:
    print("Missing dependencies. Install with: python -m pip install pytesseract pillow python-dotenv")
    raise

# Load environment variables from .env file (parent directory)
load_dotenv(Path(__file__).parent.parent / ".env")

# Set pytesseract path if TESSERACT_CMD is defined
# Try hardcoded path first as fallback
tesseract_cmd = os.getenv("TESSERACT_CMD") or r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if tesseract_cmd and os.path.exists(tesseract_cmd):
    pytesseract.pytesseract.pytesseract_cmd = tesseract_cmd
    # Also set TESSDATA_PREFIX for language data files
    tessdata_dir = os.path.dirname(tesseract_cmd) + r"\tessdata"
    if os.path.exists(tessdata_dir):
        os.environ["TESSDATA_PREFIX"] = tessdata_dir


def setup_logging():
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    logfile = Path("ocr_logs") / f"local_ocr_{ts}.log"
    logfile.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(logfile, encoding="utf-8"),
        ],
    )
    return logfile


def ocr_image(img_path: Path):
    logging.info(f"OCR image {img_path}")
    img = Image.open(img_path).convert("RGB")
    text = pytesseract.image_to_string(img)
    return text


def process_file(path: Path, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    if path.suffix.lower() == ".pdf":
        # For PDFs, try to use pdf2image if available; otherwise, skip.
        try:
            from pdf2image import convert_from_path

            pages = convert_from_path(str(path))
            texts = []
            for i, p in enumerate(pages, start=1):
                t = pytesseract.image_to_string(p)
                texts.append(t)
            text = "\n\n".join(texts)
        except Exception as e:
            logging.error(f"pdf2image not available or failed: {e}")
            return False
    else:
        text = ocr_image(path)

    out_file = out_dir / f"{path.stem}.txt"
    out_file.write_text(text, encoding="utf-8")
    logging.info(f"Wrote {out_file}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Local OCR using pytesseract")
    parser.add_argument("--input", "-i", required=True, help="File or directory to process")
    parser.add_argument("--output", "-o", default="ocr_output", help="Output directory")
    args = parser.parse_args()

    log = setup_logging()
    logging.info("Starting local OCR")

    inp = Path(args.input)
    out_dir = Path(args.output)

    paths = []
    if inp.is_file():
        paths = [inp]
    elif inp.is_dir():
        # common image extensions
        exts = {".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".gif", ".webp", ".pdf"}
        paths = [p for p in sorted(inp.rglob("*")) if p.is_file() and p.suffix.lower() in exts]
    else:
        logging.error(f"Input path not found: {inp}")
        sys.exit(1)

    summary = {"processed": 0, "failed": 0}
    for p in paths:
        try:
            ok = process_file(p, out_dir)
            if ok:
                summary["processed"] += 1
            else:
                summary["failed"] += 1
        except Exception as e:
            logging.exception(f"Failed {p}: {e}")
            summary["failed"] += 1

    logging.info(f"Done. Processed: {summary['processed']}, Failed: {summary['failed']}")


if __name__ == "__main__":
    main()
