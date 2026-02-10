from fastapi import APIRouter, HTTPException
from app.models.schemas import ParseRequest, ParseResponse
from app.services.docling_parser import parse_document_with_docling

router = APIRouter()


@router.post("/parse", response_model=ParseResponse)
async def parse_document(request: ParseRequest):
    """
    Parse a document using Docling and return normalized chunks
    """
    try:
        chunks = await parse_document_with_docling(request.filePath)

        return ParseResponse(
            documentId=request.documentId,
            chunks=chunks,
            chunkCount=len(chunks),
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.filePath}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")
