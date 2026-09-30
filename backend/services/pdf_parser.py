import io
import re
from typing import Dict, Any, Tuple
from pypdf import PdfReader


def clean_extracted_text(text: str) -> str:
    """Cleans raw extracted text from PDFs or files."""
    if not text:
        return ""
    # Replace non-printable characters except standard newlines and tabs
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    # Normalize multiple consecutive spaces/newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts text from PDF bytes using pypdf.
    Returns (cleaned_text, page_count).
    """
    if not pdf_bytes:
        raise ValueError("Provided PDF file is empty.")

    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_stream)
        
        if len(reader.pages) == 0:
            raise ValueError("PDF contains no readable pages.")

        extracted_pages = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(page_text.strip())

        full_text = "\n\n".join(extracted_pages)
        cleaned = clean_extracted_text(full_text)

        if not cleaned:
            raise ValueError("No extractable text found in PDF (file may be scanned/image-only).")

        return cleaned, len(reader.pages)

    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def validate_chapter_text(text: str, min_chars: int = 20) -> Dict[str, Any]:
    """Validates chapter text and returns metadata statistics."""
    cleaned = clean_extracted_text(text)
    char_count = len(cleaned)
    
    if char_count < min_chars:
        return {
            "valid": False,
            "error": f"Chapter text is too short ({char_count} chars). Minimum {min_chars} characters required.",
            "character_count": char_count,
            "word_count": 0,
        }

    words = cleaned.split()
    word_count = len(words)

    return {
        "valid": True,
        "error": None,
        "character_count": char_count,
        "word_count": word_count,
    }
