
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import re

# Define request model
class RequestModel(BaseModel):
    prompt: str
    max_tokens: int = 100

# Load the LLaMA 3.2 1B model
MODEL_NAME = "meta-llama/Llama-3.2-1B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_auth_token="")
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.float16, device_map="auto", use_auth_token="")

# Initialize FastAPI
app = FastAPI()

# Enable CORS (Allow frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
)

def clean_generated_text(text: str) -> str:
    """Remove leading/trailing quotes from response."""
    cleaned_text = re.sub(r'^["“”]+|["“”]+$', '', text)  # Remove surrounding quotes
    cleaned_text = re.sub(r'^[^:]*:', '', cleaned_text)  # Remove everything before the first colon
    cleaned_text = re.sub(r'You are a personal inspirational coach\.', '', cleaned_text) # If "You are a personal inspirational coach." is in the text, remove it
    # If there is a leading quote, remove it
    if cleaned_text.startswith('"'):
        cleaned_text = cleaned_text[1:].strip()

    return cleaned_text.strip()

@app.post("/generate")
async def generate_text(request: RequestModel):
    print(f"Received prompt: {request.prompt}")  # Debugging line
    inputs = tokenizer(request.prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    outputs = model.generate(**inputs, max_new_tokens=request.max_tokens)
    
    # Decode response and remove input prompt
    full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Extract only the generated text (after the prompt)
    generated_response = clean_generated_text(full_response.replace(request.prompt, "").strip())

    return {"response": generated_response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
