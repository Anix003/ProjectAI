import os
import sys
import base64
import logging

# Ensure project root is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env variables
load_dotenv(dotenv_path=".env.local")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ai_server")

app = FastAPI(title="Civic AI - AI Engine", version="1.0.0")

# Enable CORS for Next.js app gateway queries
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Request Models
class ComplaintRequest(BaseModel):
  title: str
  description: str
  image_base64: Optional[str] = None
  mime_type: Optional[str] = None
  existing_complaints: Optional[List[Dict[str, Any]]] = []

class ChatMessage(BaseModel):
  sender: str  # "user" or "ai"
  message: str

class ChatRequest(BaseModel):
  history: List[ChatMessage]
  new_message: str

class KYCRequest(BaseModel):
  selfie_base64: str
  id_base64: str
  doc_type: str
  user_name: str

# Endpoints
@app.post("/api/ai/analyze-complaint")
async def analyze_complaint_endpoint(req: ComplaintRequest):
  from ai.services.complaint_analysis import analyze_incoming_complaint
  
  image_bytes = None
  if req.image_base64:
    try:
      # Strip data URL header if present
      header_str = "base64,"
      b64_str = req.image_base64
      if header_str in b64_str:
        b64_str = b64_str.split(header_str)[1]
      image_bytes = base64.b64decode(b64_str)
    except Exception as e:
      logger.error(f"Failed to decode base64 image: {e}")
      raise HTTPException(status_code=400, detail="Invalid image base64 data")

  try:
    result = await analyze_incoming_complaint(
      title=req.title,
      description=req.description,
      image_bytes=image_bytes,
      mime_type=req.mime_type,
      existing_complaints=req.existing_complaints or []
    )
    return result
  except Exception as e:
    logger.error(f"Error analyzing complaint: {e}")
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
async def chat_endpoint(req: ChatRequest):
  from ai.services.chat_service import get_cosmos_chat_response
  
  # Format history for internal provider service
  history_list = [{"sender": msg.sender, "message": msg.message} for msg in req.history]
  
  try:
    response = await get_cosmos_chat_response(history_list, req.new_message)
    return {"response": response}
  except Exception as e:
    logger.error(f"Error in chat: {e}")
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/verify-kyc")
async def verify_kyc_endpoint(req: KYCRequest):
  from ai.providers.factory import get_provider
  
  try:
    # Decode selfie and ID document
    try:
      selfie_bytes = base64.b64decode(req.selfie_base64.split("base64,")[1] if "base64," in req.selfie_base64 else req.selfie_base64)
      id_bytes = base64.b64decode(req.id_base64.split("base64,")[1] if "base64," in req.id_base64 else req.id_base64)
    except Exception as e:
      logger.error(f"Failed to decode KYC base64 images: {e}")
      raise HTTPException(status_code=400, detail="Invalid face/ID card base64 data")

    provider = get_provider()
    kyc_result = await provider.verify_kyc_documents(
      selfie_bytes=selfie_bytes,
      id_bytes=id_bytes,
      doc_type=req.doc_type,
      user_name=req.user_name
    )
    return kyc_result
  except Exception as e:
    logger.error(f"Error verifying KYC documents: {e}")
    raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
  provider = os.getenv("AI_PROVIDER", "gemini")
  return {
    "status": "healthy",
    "provider_configured": provider,
    "gemini_api_key_configured": os.getenv("GEMINI_API_KEY") is not None,
    "openai_api_key_configured": os.getenv("OPENAI_API_KEY") is not None
  }

if __name__ == "__main__":
  import uvicorn
  port = int(os.getenv("AI_PORT", 8000))
  uvicorn.run("ai.main:app", host="0.0.0.0", port=port, reload=True)
