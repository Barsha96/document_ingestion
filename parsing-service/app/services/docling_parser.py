import os
from pathlib import Path
from docling.document_converter import DocumentConverter
from app.models.schemas import NormalizedChunk
from app.services.normalizer import semantic_chunk


async def parse_document_with_docling(file_path: str) -> list[NormalizedChunk]:
    """
    Parse document using Docling and return normalized chunks
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    try:
        # Initialize Docling converter
        converter = DocumentConverter()

        # Convert document to Markdown
        result = converter.convert(file_path)

        # Get markdown content
        markdown_content = result.document.export_to_markdown()

        # Get document name from file path
        filename = Path(file_path).name

        # Perform semantic chunking
        chunks = semantic_chunk(markdown_content, filename)

        return chunks

    except Exception as e:
        print(f"Error parsing document with Docling: {e}")
        raise
