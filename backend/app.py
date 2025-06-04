import logging
import logging.config
import os
import requests
import json
from langchain.schema import (
    BaseMessage,
    HumanMessage,
    AIMessage
)
from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.llms.base import LLM
from typing import List, Optional

# -------------------- Logging --------------------

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "uvicorn.error": {"level": "INFO"},
        "uvicorn.access": {"level": "INFO", "handlers": ["console"]},
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("uvicorn.info")

def get_logger():
    return logger

logger.info("Initializing...")

# -------------------- API Key --------------------

def get_openrouter_api_key():
    with open("openrouter_api_key.txt", "r") as file:
        return file.read().strip()

# -------------------- Custom LLM --------------------

class OpenRouterLLM(LLM):
    model: str = "deepseek/deepseek-r1:free"
    api_key: Optional[str] = None
    site_url: str = "http://localhost:3000"
    site_name: str = "MyLocalAIApp"

    @property
    def _llm_type(self) -> str:
        return "openrouter"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        logger.info("Sending request to OpenRouter")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
        }

        body = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
        }

        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(body),
        )

        if response.status_code != 200:
            logger.error(f"OpenRouter error: {response.text}")
            raise Exception("Failed to call OpenRouter API")

        output = response.json()
        return output["choices"][0]["message"]["content"]

# -------------------- LLM Handler --------------------

def call_llm(messages, api_key):
    prompt = ChatPromptTemplate(
        messages=[
            SystemMessagePromptTemplate.from_template(
                "You are a helpful assistant for planning trips."
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{question}"),
        ]
    )

    try:
        logger.info("Using OpenRouter with LangChain")
        llm = OpenRouterLLM(api_key=api_key)

        # Format chat history for LangChain
        chatHistory = []
        for m in messages:
            if m["role"] == "user":
                chatHistory.append(HumanMessage(content=m["content"]))
            elif m["role"] == "assistant":
                chatHistory.append(AIMessage(content=m["content"]))

        # Compose full input with prompt template
        chain = LLMChain(llm=llm, prompt=prompt)
        response = chain.run({"question": messages[-1]["content"], "chat_history": chatHistory[:-1]})

        return {"role": "assistant", "content": response}

    except Exception as e:
        logger.error(e)
        raise e