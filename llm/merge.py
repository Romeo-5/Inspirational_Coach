import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# Paths
BASE_MODEL_PATH = "meta-llama/Llama-3.2-1B-Instruct"  # Base LLaMA model
FINETUNED_ADAPTER_PATH = "./weights"  # Path to LoRA adapter
MERGED_MODEL_PATH = "./llama-finetuned"  # Where to save the merged model

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_PATH,
    token="",
    torch_dtype=torch.float16,
    device_map="auto"
)

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_PATH)

# Merge LoRA adapter with base model
model = PeftModel.from_pretrained(base_model, FINETUNED_ADAPTER_PATH)
model = model.merge_and_unload()  # Merge LoRA into the base model

# Save the merged model & tokenizer
model.save_pretrained(MERGED_MODEL_PATH)
tokenizer.save_pretrained(MERGED_MODEL_PATH)

print("✅ Merged model saved to:", MERGED_MODEL_PATH)
