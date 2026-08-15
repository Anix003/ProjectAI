import logging
from typing import List, Dict
from ai.providers.factory import get_provider

logger = logging.getLogger(__name__)

async def get_cosmos_chat_response(history: List[Dict[str, str]], new_message: str) -> str:
  """
  Directs the chat query to the configured AI provider factory.
  """
  logger.info(f"Cosmos AI received message: '{new_message}'")
  provider = get_provider()
  return await provider.chat_with_cosmos(history, new_message)
