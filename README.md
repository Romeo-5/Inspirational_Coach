# 🌍 Cross-Cultural AI Coach: Fine-Tuned LLM Application

![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Llama](https://img.shields.io/badge/Llama-3.2--1B-purple)
![Latency](https://img.shields.io/badge/Latency-<200ms-green)

An AI-powered coaching application using fine-tuned Llama 3.2-1B with parameter-efficient methods, deployed with sub-200ms inference latency.

## 🎯 Highlights
- Fine-tuned **Llama 3.2-1B** using QLoRA (parameter-efficient)
- **95% cost reduction** vs. full fine-tuning
- **Sub-200ms inference latency**
- Deployed with FastAPI 
- Comprehensive evaluation pipeline

## 🛠️ Tech Stack
- **Model:** Llama 3.2-1B (Meta)
- **Fine-tuning:** QLoRA, Low-Rank Adaptation
- **Framework:** PyTorch, Hugging Face Transformers
- **Deployment:** FastAPI, REST API
- **Optimization:** Model quantization (FP32→INT8)

## 🔬 Technical Approach
### Fine-Tuning
- **Method:** QLoRA (Quantized Low-Rank Adaptation)
- **Training Data:** Custom real + synthetic inspiralional data
- **Training Time:** 6 GPU-hours (vs. 120 hours full fine-tuning)

### Optimization
- Model quantization: FP32 → INT8
- 4x throughput improvement
- Maintains inference quality
- Runs on consumer hardware

## 📊 Performance Metrics
| Metric | Value |
|--------|-------|
| Inference Latency | <200ms |
| Training Cost Reduction | 95% |
| Throughput Improvement | 4x |

## 🚀 Quick Start
```bash
# Clone repo
git clone https://github.com/Romeo-5/Cross-Cultural-AI-Coach

# Install dependencies
pip install -r requirements.txt

# Run API server
python main.py

# API available at http://localhost:8000
```

## 🔍 Key Learnings
- QLoRA enables efficient fine-tuning on consumer hardware
- Quantization provides massive speedup with minimal quality loss
- Prompt engineering critical for consistent outputs
- Parameter-efficient methods democratize LLM customization

