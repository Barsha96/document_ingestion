import re
from app.models.schemas import NormalizedChunk

MAX_CHUNK_SIZE = 1000  # Maximum words per chunk


def semantic_chunk(markdown: str, filename: str) -> list[NormalizedChunk]:
    """
    Semantic chunking based on markdown headers
    Splits content by sections while preserving context
    """
    chunks = []
    chunk_serial = 0

    # Split by pages first
    page_pattern = r'##\s+Page\s+(\d+)'
    pages = re.split(page_pattern, markdown)

    # Process pages (pattern: text, page_num, content, page_num, content, ...)
    for i in range(1, len(pages), 2):
        if i + 1 >= len(pages):
            break

        page_number = int(pages[i])
        page_content = pages[i + 1]

        if not page_content.strip():
            continue

        # Split page content by headers (H3)
        section_pattern = r'(###\s+[^\n]+\n)'
        sections = re.split(section_pattern, page_content)

        current_section = ""
        current_section_title = ""

        for part in sections:
            part = part.strip()
            if not part:
                continue

            # Check if this is a header
            if part.startswith('###'):
                # Save previous section if exists
                if current_section:
                    new_chunks = split_large_chunk(
                        current_section,
                        page_number,
                        chunk_serial,
                        current_section_title
                    )
                    chunks.extend(new_chunks)
                    chunk_serial = len(chunks)

                # Start new section
                current_section_title = re.sub(r'^###\s+', '', part).strip()
                current_section = part + '\n'
            else:
                current_section += part + '\n'

        # Save last section
        if current_section:
            new_chunks = split_large_chunk(
                current_section,
                page_number,
                chunk_serial,
                current_section_title
            )
            chunks.extend(new_chunks)
            chunk_serial = len(chunks)

    # If no page markers found, chunk the entire content
    if not chunks:
        chunks.extend(split_large_chunk(markdown, 1, 0, filename))

    return chunks


def split_large_chunk(
    content: str,
    page_number: int,
    start_serial: int,
    section_title: str = None
) -> list[NormalizedChunk]:
    """
    Split large chunks that exceed MAX_CHUNK_SIZE
    """
    words = content.split()
    chunks = []

    if len(words) <= MAX_CHUNK_SIZE:
        return [
            NormalizedChunk(
                content=content.strip(),
                pageNumber=page_number,
                chunkSerial=start_serial,
                sectionTitle=section_title,
            )
        ]

    # Split into smaller chunks
    for i in range(0, len(words), MAX_CHUNK_SIZE):
        chunk_words = words[i:i + MAX_CHUNK_SIZE]
        chunk_content = ' '.join(chunk_words)

        chunks.append(
            NormalizedChunk(
                content=chunk_content.strip(),
                pageNumber=page_number,
                chunkSerial=start_serial + len(chunks),
                sectionTitle=section_title,
            )
        )

    return chunks
