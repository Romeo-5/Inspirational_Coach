from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import re

# Load fine-tuned model
MODEL_PATH = "./llama-finetuned"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH, 
    torch_dtype=torch.float16, 
    device_map="auto"
)

# Define request body
class RequestModel(BaseModel):
    prompt: str
    max_tokens: int = 150

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_generated_text(text: str) -> str:
    if isinstance(text, str):
        # Find all quotation marks in the text
        quote_positions = [match.start() for match in re.finditer(r'["""]', text)]
        
        # Check if there are at least 5 quotation marks
        if len(quote_positions) >= 5:
            # Get the position after the fifth quotation mark
            fifth_quote_pos = quote_positions[4] + 1  # +1 to exclude the quote itself
            return text[fifth_quote_pos:].strip()
        elif len(quote_positions) > 0:
            # Fallback: if fewer than 5 quotes, use the last one
            last_quote_pos = quote_positions[-1] + 1
            return text[last_quote_pos:].strip()
        return text  # Return original if no quotation marks found
    return text  # Return unchanged if not a string

@app.post("/generate")
async def generate_text(request: RequestModel):
    print(f"Received prompt: {request.prompt}")  # Debugging line

    inputs = tokenizer(request.prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    outputs = model.generate(**inputs, max_new_tokens=request.max_tokens)

    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Clean the generated response
    cleaned_text = clean_generated_text(generated_text)

    return {"response": cleaned_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
