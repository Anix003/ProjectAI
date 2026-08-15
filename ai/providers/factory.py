import os
import logging
from ai.providers.base import BaseAIProvider
from ai.providers.gemini import GeminiProvider
from ai.providers.openai import OpenAIProvider
from ai.providers.local import LocalProvider

logger = logging.getLogger(__name__)

def get_provider() -> BaseAIProvider:
  provider_env = os.getenv("AI_PROVIDER", "gemini").lower()
  
  if provider_env == "local":
    logger.info("Factory: Instantiating LocalProvider.")
    return LocalProvider()
  elif provider_env == "openai":
    logger.info("Factory: Instantiating OpenAIProvider.")
    return OpenAIProvider()
  elif provider_env == "gemini":
    logger.info("Factory: Instantiating GeminiProvider.")
    return GeminiProvider()
  else:
    logger.warning(f"Factory: Unknown AI_PROVIDER '{provider_env}'. Defaulting to GeminiProvider.")
    return GeminiProvider()
