from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset
from transformers import Trainer, TrainingArguments, DataCollatorForLanguageModeling, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch

# Enable memory-efficient CUDA settings
import os
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# Load LLaMA 1B model with 4-bit quantization using BitsAndBytesConfig
MODEL_NAME = "meta-llama/Llama-3.2-1B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, token="")

# Configure 4-bit quantization properly
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,  # Match model dtype to prevent warnings
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    token="",
    quantization_config=quantization_config,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Set pad_token 
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Load Dataset
dataset = load_dataset("csv", data_files="cleaned_dataset.csv")

# Tokenize data with max_length optimization
def tokenize_function(examples):
    return tokenizer(
        examples["Text"], 
        padding="max_length", 
        truncation=True, 
        max_length=256, 
        return_tensors="pt"  # Ensure tensor outputs
    )

tokenized_datasets = dataset.map(tokenize_function, batched=True, remove_columns=["Text"])
tokenized_datasets = tokenized_datasets.with_format("torch")  # Ensure proper format

# Prepare model for k-bit training
model = prepare_model_for_kbit_training(model)

# LoRA Configuration
lora_config = LoraConfig(
    r=8,  # Slightly higher rank for better learning
    lora_alpha=32,
    lora_dropout=0.1,
    bias="none",  # Important for stability
    task_type="CAUSAL_LM",  # Specify task type explicitly
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"]  # Include more attention modules
)

# Apply LoRA to Model
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# Data collator
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer, 
    mlm=False
)

# Training Configuration with Optimized Settings
training_args = TrainingArguments(
    output_dir="./llama-finetuned",
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=8,
    logging_dir="./logs",
    logging_steps=10,
    eval_strategy="steps",  # Updated from evaluation_strategy
    save_strategy="steps",
    save_steps=200,
    learning_rate=2e-4,  # Slightly higher learning rate for LoRA
    num_train_epochs=1,
    report_to="none",
    fp16=True,
    gradient_checkpointing=True,
    optim="paged_adamw_8bit",  # Better optimizer for memory efficiency
    save_total_limit=2,
    warmup_ratio=0.03,  # Add warmup
    lr_scheduler_type="cosine",  # Better scheduler
    seed=42,  # Set seed for reproducibility
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["train"].select(range(min(100, len(tokenized_datasets["train"])))),  # Smaller eval dataset
    data_collator=data_collator,
)

# Free memory before training
torch.cuda.empty_cache()
print("Starting training...")
trainer.train()

# Save the model after training
model.save_pretrained("./llama-finetuned-final")
tokenizer.save_pretrained("./llama-finetuned-final")
print("Training complete and model saved!")