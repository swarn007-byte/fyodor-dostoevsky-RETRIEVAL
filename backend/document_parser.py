"""PDF parsing and chunking.

Chunking strategy: recursive / structure-aware splitting.
Tries the "biggest" structural separator first (paragraph break), and only
falls back to smaller units (line, sentence, word, character) for pieces
that are still bigger than chunk_size. This keeps naturally-related text
(like one resume section) together in one chunk instead of cutting blindly
every N characters.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from io import BytesIO
from typing import Iterable

from pypdf import PdfReader


DEFAULT_CHUNK_SIZE = 900
DEFAULT_CHUNK_OVERLAP = 120

# Priority order: paragraph > line > sentence > word (character handled by fallback).
RECURSIVE_SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", "; ", " "]


@dataclass
class Chunk:
    text: str
    page: int  # 1-indexed source PDF page


def adaptive_chunk_size(total_chars: int) -> int:
    """Pick chunk size based on document length.

    Small docs (resumes, letters, < 3k chars) → 400 chars
    Medium docs (3k-10k chars) → 700 chars
    Large docs (> 10k chars) → 900 chars (default)

    Small docs get finer chunks so retrieval is precise.
    Large docs get bigger chunks to preserve context across sections.
    """
    if total_chars < 3_000:
        return 400
    if total_chars < 10_000:
        return 700
    return DEFAULT_CHUNK_SIZE


# ---------------------------------------------------------------------------
# PDF text extraction
# ---------------------------------------------------------------------------

def extract_pdf_pages(pdf_bytes: bytes) -> list[str]:
    """Extract text per page, preserving paragraph structure."""
    reader = PdfReader(BytesIO(pdf_bytes))
    pages: list[str] = []
    for page in reader.pages:
        raw = page.extract_text() or ""
        raw = re.sub(r"[ \t]+", " ", raw)
        raw = re.sub(r"\n{3,}", "\n\n", raw)
        pages.append(raw.strip())
    return pages


def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Whole-document text with paragraph breaks preserved (for summaries)."""
    return "\n\n".join(page for page in extract_pdf_pages(pdf_bytes) if page)


# ---------------------------------------------------------------------------
# Recursive chunking
# ---------------------------------------------------------------------------

def _split_on_separator(text: str, separator: str) -> list[str]:
    return text.split(separator)


def recursive_split(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_CHUNK_OVERLAP,
    separators: list[str] | None = None,
) -> list[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    seps = separators if separators is not None else RECURSIVE_SEPARATORS
    if not seps:
        return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

    separator, *rest_separators = seps
    pieces = [p for p in _split_on_separator(text, separator) if p.strip()]

    if len(pieces) <= 1:
        return recursive_split(text, chunk_size, overlap, rest_separators)

    chunks: list[str] = []
    current = ""
    for piece in pieces:
        piece = piece.strip()
        if not piece:
            continue

        if len(piece) > chunk_size:
            if current:
                chunks.append(current)
                current = ""
            chunks.extend(recursive_split(piece, chunk_size, overlap, rest_separators))
            continue

        candidate = f"{current}{separator}{piece}" if current else piece
        if len(candidate) <= chunk_size:
            current = candidate
        else:
            if current:
                chunks.append(current)
            current = piece

    if current:
        chunks.append(current)

    return _apply_overlap(chunks, overlap)


def _apply_overlap(chunks: list[str], overlap: int) -> list[str]:
    if overlap <= 0 or len(chunks) <= 1:
        return chunks
    overlapped = [chunks[0]]
    for i in range(1, len(chunks)):
        tail = chunks[i - 1][-overlap:]
        space_idx = tail.find(" ")
        if space_idx != -1:
            tail = tail[space_idx + 1:]
        overlapped.append(f"{tail} {chunks[i]}".strip() if tail else chunks[i])
    return overlapped


def split_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[str]:
    return recursive_split(text, chunk_size, overlap)


def split_pdf_chunks(
    pdf_bytes: bytes,
    chunk_size: int | None = None,
    overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[Chunk]:
    """Page-aware chunking with adaptive chunk size.

    If chunk_size is not provided, it's automatically chosen based on
    total document length (smaller for resumes, larger for big docs).
    """
    pages = extract_pdf_pages(pdf_bytes)
    total_chars = sum(len(p) for p in pages)
    effective_size = chunk_size if chunk_size is not None else adaptive_chunk_size(total_chars)

    chunks: list[Chunk] = []
    for page_number, page_text in enumerate(pages, start=1):
        if not page_text.strip():
            continue
        for piece in recursive_split(page_text, effective_size, overlap):
            chunks.append(Chunk(text=piece, page=page_number))
    return chunks


def split_pdf_text(pdf_bytes: bytes) -> list[str]:
    return [chunk.text for chunk in split_pdf_chunks(pdf_bytes)]


# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------

def compact_text(text: str, limit: int = 1800) -> str:
    seen: set[str] = set()
    sentences = re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", text).strip())
    compacted: list[str] = []
    for sentence in sentences:
        key = re.sub(r"[^a-z0-9]+", " ", sentence.lower()).strip()
        if len(key) < 8 or key in seen:
            continue
        seen.add(key)
        compacted.append(sentence.strip())
        if sum(len(item) for item in compacted) >= limit:
            break
    return " ".join(compacted)[:limit] if compacted else text[:limit]


def _truncate(text: str, limit: int = 1400) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0] + "…"


def source_chunks(title: str, chunks: Iterable[str | Chunk]) -> list[str]:
    formatted: list[str] = []
    for index, chunk in enumerate(chunks, start=1):
        if isinstance(chunk, Chunk):
            formatted.append(
                f'<source name="{title}" page="{chunk.page}" chunk="{index}">\n'
                f'{_truncate(chunk.text)}\n</source>'
            )
        else:
            formatted.append(
                f'<source name="{title}" chunk="{index}">\n{_truncate(chunk)}\n</source>'
            )
    return formatted
