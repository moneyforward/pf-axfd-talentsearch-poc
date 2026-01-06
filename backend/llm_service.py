"""
LLM Service - Abstraction layer for multiple LLM providers
Supports Azure OpenAI and Google Gemini with easy switching via environment variables

Usage:
    To switch between LLM providers, simply set the LLM_PROVIDER environment variable:
    
    For Azure OpenAI:
        LLM_PROVIDER=azure_openai
        AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
        AZURE_OPENAI_API_KEY=your-key-here
    
    For Google Gemini:
        LLM_PROVIDER=google_gemini
        GOOGLE_GEMINI_API_KEY=your-key-here
        GOOGLE_GEMINI_MODEL=gemini-1.5-pro  # Optional, defaults to gemini-1.5-pro
    
    Then use the call_llm() function throughout your code:
        from llm_service import call_llm
        
        response = await call_llm(
            messages=[{"role": "user", "content": "Hello!"}],
            temperature=0.0,
            use_json_format=False
        )
"""
import os
import json
import logging
import asyncio
from typing import List, Dict, Optional
from enum import Enum
import httpx

logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    AZURE_OPENAI = "azure_openai"
    GOOGLE_GEMINI = "google_gemini"


class LLMService:
    """
    Unified LLM service that abstracts away the differences between providers.
    Switch providers by setting the LLM_PROVIDER environment variable.
    """
    
    def __init__(self):
        """Initialize the LLM service based on environment configuration"""
        # Load provider from environment (default to azure_openai for backward compatibility)
        provider_str = os.getenv("LLM_PROVIDER", "azure_openai").lower()
        
        try:
            self.provider = LLMProvider(provider_str)
        except ValueError:
            logger.warning(
                f"Invalid LLM_PROVIDER '{provider_str}'. Valid options: azure_openai, google_gemini. "
                f"Defaulting to azure_openai."
            )
            self.provider = LLMProvider.AZURE_OPENAI
        
        # Load provider-specific configuration
        self._load_config()
        
        logger.info(f"LLM Service initialized with provider: {self.provider.value}")
    
    def _load_config(self):
        """Load configuration for the selected provider"""
        if self.provider == LLMProvider.AZURE_OPENAI:
            self._load_azure_config()
        elif self.provider == LLMProvider.GOOGLE_GEMINI:
            self._load_gemini_config()
    
    def _load_azure_config(self):
        """Load Azure OpenAI configuration"""
        from pathlib import Path
        
        BASE_DIR = Path(__file__).parent
        ENV_FILE = BASE_DIR / ".env"
        
        def load_env_file(file_path: Path) -> dict:
            env_vars = {}
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith('#'):
                                if '=' in line:
                                    key, value = line.split('=', 1)
                                    env_vars[key.strip()] = value.strip()
                except Exception as e:
                    logger.warning(f"Error loading .env file: {e}")
            return env_vars
        
        _env_vars = load_env_file(ENV_FILE)
        
        self.endpoint = os.getenv(
            "AZURE_OPENAI_ENDPOINT",
            _env_vars.get("AZURE_OPENAI_ENDPOINT", "")
        )
        self.api_key = os.getenv(
            "AZURE_OPENAI_API_KEY",
            _env_vars.get("AZURE_OPENAI_API_KEY", "")
        )
        self.api_version = os.getenv(
            "AZURE_OPENAI_API_VERSION",
            _env_vars.get("AZURE_OPENAI_API_VERSION", "2024-10-21")
        )
        self.deployment = os.getenv(
            "AZURE_OPENAI_DEPLOYMENT",
            _env_vars.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
        )
        
        if not self.endpoint or not self.api_key:
            logger.warning(
                "Azure OpenAI credentials not found. "
                "Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY."
            )
    
    def _load_gemini_config(self):
        """Load Google Gemini configuration"""
        from pathlib import Path
        
        BASE_DIR = Path(__file__).parent
        ENV_FILE = BASE_DIR / ".env"
        
        def load_env_file(file_path: Path) -> dict:
            env_vars = {}
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith('#'):
                                if '=' in line:
                                    key, value = line.split('=', 1)
                                    env_vars[key.strip()] = value.strip()
                except Exception as e:
                    logger.warning(f"Error loading .env file: {e}")
            return env_vars
        
        _env_vars = load_env_file(ENV_FILE)
        
        self.api_key = os.getenv(
            "GOOGLE_GEMINI_API_KEY",
            _env_vars.get("GOOGLE_GEMINI_API_KEY", "")
        )
        self.model = os.getenv(
            "GOOGLE_GEMINI_MODEL",
            _env_vars.get("GOOGLE_GEMINI_MODEL", "gemini-1.5-pro")
        )
        
        if not self.api_key:
            logger.warning(
                "Google Gemini API key not found. "
                "Please set GOOGLE_GEMINI_API_KEY."
            )
    
    async def call(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.0,
        use_json_format: bool = False
    ) -> Dict:
        """
        Unified interface to call the configured LLM provider.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            temperature: Temperature for response generation (0.0 to 1.0)
            use_json_format: Whether to request JSON format response
        
        Returns:
            Dictionary containing the LLM response
        """
        if self.provider == LLMProvider.AZURE_OPENAI:
            return await self._call_azure_openai(messages, temperature, use_json_format)
        elif self.provider == LLMProvider.GOOGLE_GEMINI:
            return await self._call_gemini(messages, temperature, use_json_format)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    async def _call_azure_openai(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.0,
        use_json_format: bool = False
    ) -> Dict:
        """Call Azure OpenAI API"""
        url = f"{self.endpoint}openai/deployments/{self.deployment}/chat/completions"
        params = {"api-version": self.api_version}
        
        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key
        }
        
        payload = {
            "model": self.deployment,
            "messages": messages,
            "temperature": temperature
        }
        
        if use_json_format:
            payload["response_format"] = {"type": "json_object"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, params=params, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                result = response.json()
                
                # Log LLM response
                logger.info("=" * 80)
                logger.info("LLM API Response (Azure OpenAI):")
                logger.info(f"Model: {self.deployment}")
                logger.info(f"Temperature: {temperature}")
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    logger.info(f"Response Content:\n{content}")
                else:
                    logger.warning(f"Unexpected response structure: {result}")
                logger.info("=" * 80)
                
                return result
            except httpx.HTTPStatusError as e:
                error_detail = f"Status: {e.response.status_code}, Response: {e.response.text}"
                logger.error(f"HTTP Error (Azure OpenAI): {error_detail}")
                raise Exception(f"Azure OpenAI API error: {error_detail}")
            except Exception as e:
                logger.error(f"Error calling Azure OpenAI: {str(e)}")
                raise Exception(f"Error calling Azure OpenAI: {str(e)}")
    
    async def _call_gemini(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.0,
        use_json_format: bool = False
    ) -> Dict:
        """Call Google Gemini API"""
        try:
            import google.generativeai as genai
        except ImportError:
            raise ImportError(
                "google-generativeai package is required for Gemini support. "
                "Install it with: pip install google-generativeai"
            )
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Convert messages format for Gemini
        # Gemini uses a different message format - we need to convert from OpenAI format
        system_instruction = None
        conversation_parts = []
        
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            if role == "system":
                system_instruction = content
            elif role == "user":
                conversation_parts.append({"role": "user", "parts": [content]})
            elif role == "assistant":
                conversation_parts.append({"role": "model", "parts": [content]})
        
        # Create model instance
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
        )
        
        if use_json_format:
            # For JSON format, we'll add it to the system instruction
            json_instruction = "\n\nIMPORTANT: You must respond with valid JSON only. Do not include any markdown formatting, code fences, or explanatory text. Return only the JSON object."
            if system_instruction:
                system_instruction += json_instruction
            else:
                system_instruction = json_instruction
        
        try:
            model = genai.GenerativeModel(
                model_name=self.model,
                generation_config=generation_config,
                system_instruction=system_instruction if system_instruction else None
            )
            
            # Handle conversation history
            if len(conversation_parts) > 1:
                # Multiple messages - use chat
                history = conversation_parts[:-1]
                last_message = conversation_parts[-1]["parts"][0]
                chat = model.start_chat(history=history)
                response = await asyncio.to_thread(chat.send_message, last_message)
            elif len(conversation_parts) == 1:
                # Single message
                response = await asyncio.to_thread(model.generate_content, conversation_parts[0]["parts"][0])
            else:
                raise ValueError("No messages provided to Gemini")
            
            # Extract text from response
            response_text = response.text
            
            # Log LLM response
            logger.info("=" * 80)
            logger.info("LLM API Response (Google Gemini):")
            logger.info(f"Model: {self.model}")
            logger.info(f"Temperature: {temperature}")
            logger.info(f"Response Content:\n{response_text}")
            logger.info("=" * 80)
            
            # Convert Gemini response to OpenAI-compatible format
            # This allows the rest of the code to work without changes
            return {
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": response_text
                    }
                }]
            }
            
        except Exception as e:
            logger.error(f"Error calling Google Gemini: {str(e)}")
            raise Exception(f"Error calling Google Gemini: {str(e)}")


# Global LLM service instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create the global LLM service instance"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


async def call_llm(
    messages: List[Dict[str, str]],
    temperature: float = 0.0,
    use_json_format: bool = False
) -> Dict:
    """
    Convenience function to call the configured LLM.
    This is the main function that should be used throughout the application.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content' keys
        temperature: Temperature for response generation (0.0 to 1.0)
        use_json_format: Whether to request JSON format response
    
    Returns:
        Dictionary containing the LLM response in OpenAI-compatible format
    """
    service = get_llm_service()
    return await service.call(messages, temperature, use_json_format)

