from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.getenv('GROQ_API_KEY')
client = Groq(api_key=api_key)

for model in ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b']:
    try:
        res = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": 'Return JSON: {"status": "success", "model": "' + model + '"}'}],
            response_format={"type": "json_object"}
        )
        print(f"SUCCESS with {model}:", res.choices[0].message.content)
        break
    except Exception as e:
        print(f"FAILED with {model}:", e)
