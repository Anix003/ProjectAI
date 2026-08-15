import os
import json
import logging
import requests
from typing import List, Dict, Any
from ai.providers.base import BaseAIProvider

logger = logging.getLogger(__name__)

class LocalProvider(BaseAIProvider):
  def __init__(self):
    self.host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    self.model = os.getenv("OLLAMA_MODEL", "llama3.2")
    logger.info(f"LocalProvider initialized with Ollama at {self.host} using {self.model}.")

  async def analyze_complaint(self, title: str, description: str) -> Dict[str, Any]:
    prompt = f"""
    Analyze this civic complaint and output ONLY a valid JSON object. No other text.
    Title: {title}
    Description: {description}

    JSON structure to return:
    {{
      "ai_category": "Water Supply" | "Road Maintenance" | "Sanitation" | "Electricity" | "Drainage" | "Other",
      "department": "Water Supply" | "Road Maintenance" | "Sanitation" | "Electricity" | "Drainage" | "Other",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "severity": 1..10 (integer),
      "is_spam": true | false,
      "ai_summary": "one sentence summary",
      "fraud_reason": "spam reason or empty string",
      "required_docs": ["List", "of", "docs"],
      "officer_category": "Water Head" | "Road Head" | "Waste Management Head" | "Electric Head" | "Finance Head",
      "estimated_resolution_hours": 24 | 48 | 72 | 120 (integer)
    }}
    """

    try:
      response = requests.post(
        f"{self.host}/api/generate",
        json={
          "model": self.model,
          "prompt": prompt,
          "format": "json",
          "stream": False
        },
        timeout=120
      )
      
      if response.status_code == 200:
        res_data = response.json()
        return json.loads(res_data.get("response", "{}"))
      else:
        logger.warning(f"Ollama server returned status code: {response.status_code}")
        return self._simulate_analysis(title, description)
    except Exception as e:
      logger.error(f"Local Ollama analysis failed: {e}. Falling back to simulation.")
      return self._simulate_analysis(title, description)

  async def chat_with_cosmos(self, history: List[Dict[str, str]], new_message: str) -> str:
    # Build prompt from history
    system_instruction = (
      "You are Cosmos AI, the smart assistant for Civic AI, India's AI-Powered Grievance Platform. "
      "Help citizens file complaints, explain status, and explain legal municipal procedures. Keep responses concise."
    )
    
    prompt = f"System: {system_instruction}\n"
    for h in history:
      role_label = "User" if h["sender"] == "user" else "Assistant"
      prompt += f"{role_label}: {h['message']}\n"
      
    prompt += f"User: {new_message}\nAssistant:"

    try:
      response = requests.post(
        f"{self.host}/api/generate",
        json={
          "model": self.model,
          "prompt": prompt,
          "stream": False
        },
        timeout=120
      )
      
      if response.status_code == 200:
        return response.json().get("response", "").strip()
    except Exception as e:
      logger.error(f"Local Ollama chat failed: {e}")
    
    return f"[Simulation] Cosmos AI (Local): Thank you for your message. Ollama did not respond. You said: '{new_message}'."

  async def ocr_and_analyze_image(self, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
    # Local Llama 3.2 doesn't have vision support unless llama3.2-vision is loaded.
    # To keep it extremely robust, we fall back to a mock OCR and describe it.
    logger.info("Local provider falling back to mock OCR (Ollama Llama 3.2 is text-only by default).")
    return {
      "description": "Local provider mock analysis: Image shows a municipal infrastructure defect.",
      "ocr_text": "LOCAL OLLAMA OCR SIMULATION",
      "confidence": 0.85
    }

  async def verify_kyc_documents(self, selfie_bytes: bytes, id_bytes: bytes, doc_type: str, user_name: str) -> Dict[str, Any]:
    logger.info("Local provider falling back to mock KYC verification.")
    return {
      "kyc_id_matched": True,
      "face_match_score": 0.90,
      "extracted_name": user_name,
      "document_number": "LOCAL-MOCKED-8899",
      "status": "Verified",
      "details": "Local KYC simulation completed successfully."
    }

  def _simulate_analysis(self, title: str, description: str) -> Dict[str, Any]:
    from ai.providers.gemini import GeminiProvider
    return GeminiProvider()._simulate_analysis(title, description)
