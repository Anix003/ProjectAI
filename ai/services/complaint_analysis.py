import logging
from typing import List, Dict, Any, Optional
from ai.providers.factory import get_provider
from ai.services.duplicate_detection import check_for_duplicates

logger = logging.getLogger(__name__)

async def analyze_incoming_complaint(
  title: str,
  description: str,
  image_bytes: Optional[bytes] = None,
  mime_type: Optional[str] = None,
  existing_complaints: List[Dict[str, Any]] = []
) -> Dict[str, Any]:
  """
  Orchestrates the complete complaint analysis pipeline:
  1. Base classification (category, priority, spam detection)
  2. Image analysis (OCR & image validation if available)
  3. Duplicate detection against existing active cases
  """
  logger.info(f"Analyzing complaint: '{title}'...")
  provider = get_provider()

  # 1. Base LLM Analysis
  analysis = await provider.analyze_complaint(title, description)
  
  # Ensure standard fields exist in the response
  result = {
    "complaint_title": title,
    "original_text": description,
    "ai_category": analysis.get("ai_category", "Other"),
    "department": analysis.get("department", "Other"),
    "priority": analysis.get("priority", "Medium"),
    "severity": analysis.get("severity", 5),
    "is_spam": analysis.get("is_spam", False),
    "ai_summary": analysis.get("ai_summary", ""),
    "required_docs": analysis.get("required_docs", []),
    "officer_category": analysis.get("officer_category", "Finance Head"),
    "estimated_resolution_hours": analysis.get("estimated_resolution_hours", 72),
    "is_duplicate": False,
    "duplicate_of": None,
    "image_analysis": None
  }

  # 2. Image Analysis if available
  if image_bytes and mime_type:
    logger.info("Processing attachment image with Vision model...")
    try:
      img_analysis = await provider.ocr_and_analyze_image(image_bytes, mime_type)
      result["image_analysis"] = img_analysis
      
      # If OCR detected important text, log it and append to summary
      ocr_txt = img_analysis.get("ocr_text", "")
      if ocr_txt:
        result["ai_summary"] += f" [Extracted OCR Text: {ocr_txt}]"
    except Exception as img_err:
      logger.error(f"Image analysis service failed: {img_err}")

  # 3. Duplicate Detection
  if existing_complaints and not result["is_spam"]:
    logger.info(f"Comparing against {len(existing_complaints)} active complaints...")
    is_dup, dup_id = check_for_duplicates(title, description, existing_complaints)
    result["is_duplicate"] = is_dup
    result["duplicate_of"] = dup_id

  return result
