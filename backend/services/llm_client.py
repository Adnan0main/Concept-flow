import os
import json
import re
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()


def clean_json_string(text: str) -> str:
    """Strips markdown code blocks, backticks, and trailing commas."""
    if not text:
        return ""
    
    # Remove markdown codeblock wrappers (```json ... ``` or ``` ...)
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text.strip(), flags=re.MULTILINE)
    text = text.strip()

    # Find the outermost JSON structure
    match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', text)
    if match:
        text = match.group(1)

    # Remove trailing commas before closing braces/brackets
    text = re.sub(r',\s*([\]}])', r'\1', text)
    return text


def call_gemini_rest(prompt: str, system_instruction: str = "") -> str:
    """Calls Gemini REST API directly using standard urllib."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    # Try gemini-1.5-flash or gemini-2.0-flash
    model_name = "gemini-1.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    contents = []
    if system_instruction:
        contents.append({
            "role": "user",
            "parts": [{"text": f"SYSTEM INSTRUCTION: {system_instruction}"}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Understood. I will strictly follow all instructions and return structured JSON."}]
        })

    contents.append({
        "role": "user",
        "parts": [{"text": prompt}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            candidates = res_body.get("candidates", [])
            if not candidates:
                raise ValueError("No response candidate returned by Gemini.")
            
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                raise ValueError("Empty parts returned by Gemini.")
            
            return parts[0].get("text", "")
            
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini API error (HTTP {e.code}): {error_msg}")
    except Exception as e:
        raise RuntimeError(f"Failed to communicate with Gemini API: {str(e)}")


def call_openai(prompt: str, system_instruction: str = "") -> str:
    """Calls OpenAI chat completion API if configured."""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured.")

    import urllib.request
    url = "https://api.openai.com/v1/chat/completions"
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        res_body = json.loads(response.read().decode("utf-8"))
        return res_body["choices"][0]["message"]["content"]


def call_groq(prompt: str, system_instruction: str = "") -> str:
    """Calls Groq Cloud API directly using standard urllib with openai/gpt-oss-120b and openai/gpt-oss-20b fallbacks."""
    api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    candidate_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    last_exc = None
    for model_name in candidate_models:
        payload = {
            "model": model_name,
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "ConceptFlow/2.0 (Windows NT 10.0; Win64; x64)"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                return res_body["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            error_msg = e.read().decode("utf-8", errors="ignore")
            last_exc = RuntimeError(f"Groq API error with {model_name} (HTTP {e.code}): {error_msg}")
            # Try next model if rate limit or model issue
            continue
        except Exception as e:
            last_exc = RuntimeError(f"Failed to communicate with Groq API ({model_name}): {str(e)}")
            continue

    raise last_exc or RuntimeError("All Groq candidate models failed.")


def call_llm_json(prompt: str, system_instruction: str = "") -> Any:
    """
    Unified LLM caller that enforces structured JSON response.
    Returns parsed Python dict or list.
    Prioritizes: Groq (ultra-fast) -> Gemini -> OpenAI.
    """
    raw_text = None
    last_error = None

    # 1. Try Groq (Llama 3.3 70B / 3.1 8B via Groq LPUs)
    if os.getenv("GROQ_API_KEY"):
        try:
            raw_text = call_groq(prompt, system_instruction)
        except Exception as e:
            last_error = e

    # 2. Try Gemini
    if not raw_text and os.getenv("GEMINI_API_KEY"):
        try:
            raw_text = call_gemini_rest(prompt, system_instruction)
        except Exception as e:
            last_error = e

    # 3. Try OpenAI
    if not raw_text and os.getenv("OPENAI_API_KEY"):
        try:
            raw_text = call_openai(prompt, system_instruction)
        except Exception as e:
            last_error = e

    if not raw_text:
        raise RuntimeError(f"LLM call failed or no API key configured. Details: {last_error}")

    # Parse and validate JSON
    cleaned = clean_json_string(raw_text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as jde:
        # Fallback repair attempt
        try:
            fixed = re.sub(r'\\([^"\\\/bfnrtu])', r'\1', cleaned)
            return json.loads(fixed)
        except Exception:
            raise ValueError(f"Failed to parse LLM JSON output: {str(jde)}\nRaw output: {raw_text[:300]}")
