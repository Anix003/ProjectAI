from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseAIProvider(ABC):
    @abstractmethod
    async def analyze_complaint(self, title: str, description: str) -> Dict[str, Any]:
        """
        Analyzes a complaint's title and description to predict its category, 
        suggested department, priority, severity, spam status, and a summary.
        """
        pass

    @abstractmethod
    async def chat_with_cosmos(self, history: List[Dict[str, str]], new_message: str) -> str:
        """
        Conducts a context-aware chat conversation as Cosmos AI assistant.
        """
        pass

    @abstractmethod
    async def ocr_and_analyze_image(self, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        """
        Runs OCR and visual analysis on a complaint image.
        """
        pass

    @abstractmethod
    async def verify_kyc_documents(self, selfie_bytes: bytes, id_bytes: bytes, doc_type: str, user_name: str) -> Dict[str, Any]:
        """
        Verifies citizen KYC details by comparing a selfie against an ID document.
        """
        pass
