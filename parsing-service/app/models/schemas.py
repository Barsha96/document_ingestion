from pydantic import BaseModel
from typing import Optional, Any


class HealthResponse(BaseModel):
    status: str
    service: str


class ParseRequest(BaseModel):
    documentId: str
    filePath: str


class NormalizedChunk(BaseModel):
    content: str
    pageNumber: int
    chunkSerial: int
    sectionTitle: Optional[str] = None
    layoutMetadata: Optional[Any] = None


class ParseResponse(BaseModel):
    documentId: str
    chunks: list[NormalizedChunk]
    chunkCount: int
