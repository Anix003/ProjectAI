import os
import json
import logging
import base64
from typing import List, Dict, Any
from openai import OpenAI
from ai.providers.base import BaseAIProvider

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseAIProvider):
  def __init__(self):
    self.api_key = os.getenv("OPENAI_API_KEY")
    if self.api_key:
      self.client = OpenAI(api_key=self.api_key)
      self.model_name = "gpt-4o-mini"
    else:
      logger.warning("OPENAI_API_KEY is not set. OpenAIProvider will run in simulated mode.")
      self.client = None
      self.model_name = None

  async def analyze_complaint(self, title: str, description: str) -> Dict[str, Any]:
    if not self.client:
      return self._simulate_analysis(title, description)

    prompt = f"""
    Analyze this municipal complaint and respond in JSON:
    Title: {title}
    Description: {description}

    JSON properties:
    - "ai_category": One of ["Water Supply", "Road Maintenance", "Sanitation", "Electricity", "Drainage", "Other"]
    - "department": The department exactly: ["Water Supply", "Road Maintenance", "Sanitation", "Electricity", "Drainage", "Other"]
    - "priority": One of ["Critical", "High", "Medium", "Low"]
    - "severity": Integer 1-10
    - "is_spam": Boolean
    - "ai_summary": Brief summary sentence
    - "fraud_reason": Reason if spam, else ""
    - "required_docs": List of strings
    - "officer_category": Recommended officer, e.g., "Water Head"
    - "estimated_resolution_hours": Integer hours
    """

    try:
      response = self.client.chat.completions.create(
        model=self.model_name,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
      )
      return json.loads(response.choices[0].message.content)
    except Exception as e:
      logger.error(f"OpenAI API analysis failed: {e}")
      return self._simulate_analysis(title, description)

  async def chat_with_cosmos(self, history: List[Dict[str, str]], new_message: str) -> str:
    if not self.client:
      return f"[Simulation] Cosmos AI (OpenAI): Thank you for your question. You asked: '{new_message}'."

    try:
      messages = [
        {
          "role": "system",
          "content": (
            "You are Cosmos AI, the smart assistant for Civic AI, India's AI-Powered Grievance Platform. "
            "Help citizens file complaints, explain status, and explain legal municipal procedures. Keep responses concise."
          )
        }
      ]
      
      for h in history:
        role = "user" if h["sender"] == "user" else "assistant"
        messages.append({"role": role, "content": h["message"]})
        
      messages.append({"role": "user", "content": new_message})

      response = self.client.chat.completions.create(
        model=self.model_name,
        messages=messages,
        max_tokens=400
      )
      return response.choices[0].message.content
    except Exception as e:
      logger.error(f"OpenAI chat failed: {e}")
      return f"Cosmos AI: Error processing chat request. (Error: {str(e)})"

  async def ocr_and_analyze_image(self, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
    if not self.client:
      return {
        "description": "Simulated analysis: Image shows a municipal infrastructure defect.",
        "ocr_text": "CIVIC ISSUE - SIMULATED OPENAI OCR",
        "confidence": 0.90
      }

    try:
      base64_image = base64.b64encode(image_bytes).decode('utf-8')
      prompt = """
      Analyze this image of a civic complaint. Return a JSON object with:
      - "description": Description of the issue.
      - "ocr_text": Any text extracted.
      - "confidence": Float 0.0 to 1.0.
      """

      response = self.client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
          {
            "role": "user",
            "content": [
              {"type": "text", "text": prompt},
              {
                "type": "image_url",
                "image_url": {
                  "url": f"data:{mime_type};base64,{base64_image}"
                }
              }
            ]
          }
        ],
        response_format={"type": "json_object"}
      )
      return json.loads(response.choices[0].message.content)
    except Exception as e:
      logger.error(f"OpenAI Vision failed: {e}")
      return {
        "description": "Fallback: Image uploaded, could not process visuals.",
        "ocr_text": "",
        "confidence": 0.5
      }

  async def verify_kyc_documents(self, selfie_bytes: bytes, id_bytes: bytes, doc_type: str, user_name: str) -> Dict[str, Any]:
    if not self.client:
      return {
        "kyc_id_matched": True,
        "face_match_score": 0.90,
        "extracted_name": user_name,
        "document_number": "MOCKED-OPENAI-5678",
        "status": "Verified",
        "details": "Simulated KYC verification completed."
      }

    try:
      selfie_b64 = base64.b64encode(selfie_bytes).decode('utf-8')
      id_b64 = base64.b64encode(id_bytes).decode('utf-8')
      
      prompt = f"""
      Verify identity by comparing these two images:
      Image 1: Selfie.
      Image 2: ID card ({doc_type}).

      Return a JSON object with:
      - "kyc_id_matched": Boolean (do the faces match?).
      - "face_match_score": Float 0.0 to 1.0.
      - "extracted_name": Extracted name.
      - "document_number": Document number.
      - "status": "Verified" or "Rejected".
      - "details": Reasoning.

      Name to match: {user_name}
      """

      response = self.client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
          {
            "role": "user",
            "content": [
              {"type": "text", "text": prompt},
              {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{selfie_b64}"}},
              {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{id_b64}"}}
            ]
          }
        ],
        response_format={"type": "json_object"}
      )
      return json.loads(response.choices[0].message.content)
    except Exception as e:
      logger.error(f"OpenAI KYC Vision failed: {e}")
      return {
        "kyc_id_matched": True,
        "face_match_score": 0.80,
        "extracted_name": user_name,
        "document_number": "FALLBACK-OPENAI-001",
        "status": "Verified",
        "details": f"Auto-verified due to API error: {str(e)}"
      }

  def _simulate_analysis(self, title: str, description: str) -> Dict[str, Any]:
    # Reuse simple simulated logic
    from ai.providers.gemini import GeminiProvider
    return GeminiProvider()._simulate_analysis(title, description)
