# 🌟 Inspirational Coach – Your AI-Powered Guide to Personal Growth 🚀

The **Inspirational Coach** is more than just an app—it's your **personal AI-driven mentor** for breaking through self-doubt, conquering procrastination, and unlocking your full potential. 🌟

Designed to **empower, uplift, and inspire**, this platform combines **personalized inspiration, goal tracking, journaling, and daily affirmations** to help you take action and build a more fulfilling life.

🔥 **Feeling stuck? Unmotivated? Lost in the social media noise?**  
**Inspirational Coach** flips the script by replacing mindless scrolling with **personalized, purpose-driven content** that fuels your **growth and well-being**.

---

## **✨ Key Features**
✅ **🎯 AI-Powered Personalization:**  
→ Get daily **inspirational insights, affirmations, and action steps** tailored to your cultural background and personal journey.

✅ **📌 Goal Setting & Progress Tracking:**  
→ Define clear, achievable goals and **visualize your progress** toward self-improvement.

✅ **📖 Guided Journaling & Reflection:**  
→ Engage in **thought-provoking journaling exercises** to boost self-awareness and mindfulness.

✅ **🔁 Adaptive Feedback Loop:**  
→ The platform **learns from your engagement** to continuously refine and improve your experience.

---

## **💡 Why It Matters: Our Mission**
💔 **The Problem:**  
Social media is designed to keep users **engaged, not empowered**. It **feeds distraction, fosters comparison, and fuels burnout**—often at the expense of real mental well-being.

✨ **Our Solution:**  
Inspirational Coach reimagines social media as a **force for good**—curating content that **inspires action, fuels self-growth, and builds a supportive, uplifting community**.

💡 **Bridging the Research Gap**:  
Despite inspiration's impact on **well-being and achievement**, research on **cross-cultural inspiration** is lacking. Our AI **analyzes global perspectives** to ensure a truly **inclusive experience**.

---

## **🛠️ Tech Stack & Software Architecture**

### **🎨 Frontend (Next.js 15 + React 19)**
🚀 **Framework:** Next.js 15.1.4 with App Router  
⚛️ **UI Library:** React 19.0.0  
🎨 **Styling:** Tailwind CSS 3.4.1  
🎯 **TypeScript:** Full type safety throughout the application  
📦 **Component Library:** Lucide React for icons  

🔹 **Features**:  
✅ Server-side rendering with Next.js App Router  
✅ User-friendly UI for **goal setting, progress tracking, and journaling**  
✅ AI-generated **daily affirmations and personalized motivation**  
✅ **Dark mode support** with context-based theme switching  
✅ **Responsive design** for mobile and desktop  

---

### **🛠️ Backend (Next.js API Routes + FastAPI)**

#### **Next.js API Layer**
⚡ **Framework:** Next.js API Routes (App Router)  
🔐 **Authentication:** NextAuth.js 4.24.11 (Google OAuth provider)  

🔹 **Key API Endpoints:**  
🔑 `/api/auth` → Google OAuth authentication via NextAuth  
🎯 `/api/generate-inspiration` → Proxy to AI service  

#### **AI Service (FastAPI + Python)**
🐍 **Framework:** FastAPI with Uvicorn server  
🤖 **Model Serving:** Transformers library for LLM inference  
⚡ **CORS:** Enabled for frontend communication  

🔹 **Endpoints:**  
📝 `/generate` → Generate personalized inspirational content  
🎯 `/goal` → Generate goal-specific motivational messages  

---

### **💾 Database & Storage**
🔥 **Database:** Firebase Firestore (NoSQL)  
🔐 **Authentication:** Firebase Auth (integrated with NextAuth)  
📦 **Collections:**  
- `users` → User profiles and preferences  
- `goals` → User goal tracking data  
- `journal-entries` → Personal journal entries  
- `saved-affirmations` → Favorited affirmations  
- `saved-inspirations` → Saved personalized content  

---

### **🧠 AI Model Integration**

#### **Model Architecture**
🤖 **Base Model:** Meta Llama 3.2-1B-Instruct  
🔧 **Fine-tuning Method:** LoRA (Low-Rank Adaptation) with PEFT  
📊 **Training Framework:** Transformers + PEFT libraries  

#### **Training Configuration**
✅ **Quantization:** 4-bit quantization with BitsAndBytes  
✅ **LoRA Config:**  
- Rank (r): 8  
- Alpha: 32  
- Dropout: 0.1  
- Target modules: `q_proj`, `k_proj`, `v_proj`, `o_proj`  

✅ **Training Parameters:**  
- Batch size: 1 (with gradient accumulation)  
- Learning rate: 2e-4 with cosine scheduler  
- Mixed precision: FP16  
- Optimizer: paged_adamw_8bit  

#### **Deployment**
🚀 **Inference Server:** FastAPI on port 8080  
⚡ **GPU Acceleration:** CUDA-enabled inference  
🔄 **Model Loading:** Automatic device mapping  
📡 **API Integration:** Axios for frontend-backend communication  

---

### **📡 Data Collection & Training Pipeline**

#### **Dataset**
📊 **Training Data:** Cultural inspiration dataset (10,000+ examples)  
🔹 **Sources:** Mix of real and synthetic culturally-diverse inspirational content  
📝 **Format:** CSV with text prompts and responses  

#### **Development Tools**
🔧 **Package Manager:** npm  
📦 **Key Dependencies:**  
- `axios` → HTTP client for API calls  
- `firebase` → Database and authentication  
- `lucide-react` → Icon components  
- `@shadcn/ui` → UI component utilities  

#### **Python Environment**
🐍 **Core Libraries:**  
- `transformers` → Model loading and inference  
- `peft` → Parameter-efficient fine-tuning  
- `bitsandbytes` → Quantization support  
- `fastapi` → API server  
- `torch` → Deep learning framework  
- `uvicorn` → ASGI server  

---

## **💡 The Future: What's Next?**
🚀 **Next Steps:**  
🔹 Expanding AI's ability to **adapt to culturally diverse understanding**  
🔹 **Gamification features** to boost engagement & goal-setting  
🔹 AI-powered **personalized coaching**  
🔹 Community features for shared inspiration  
🔹 Mobile app development (React Native)  

✨ **Want to contribute? Have feature ideas?** Join us in building a future where social media works for **personal growth**—not against it.  
