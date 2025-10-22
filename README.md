# 🧠 RAG Chatbot – Human Nutrition Assistant  
*A complete RAG pipeline and web application built entirely from scratch*

---

## 📘 Project Description

This project is a **Retrieval-Augmented Generation (RAG) Chatbot** focused on **human nutrition**.  
Unlike many projects built with LangChain or LangGraph, this system was **engineered completely from scratch**, implementing every RAG component manually — from chunking, embedding, vector search, and response generation.

Key highlights of this project:

- ✅ **Custom-built RAG pipeline** — no LangChain, no LangGraph  
- 🧩 **Chunking strategies implemented from scratch** — experimented with sentence-based, paragraph-based, and hybrid chunking  
- 🧠 **PDF ingestion & preprocessing** using PyMuPDF  
- 🗄️ **Vector database** implemented via **Supabase + pgvector**  
- ⚙️ **Custom SQL similarity function** for efficient document retrieval  
- 🧬 **Embeddings** using `BAAI/bge-small-en-v1.5`  
- 💬 **Response generation** powered by **Google Gemini 2.5 Flash**  
- 🌐 **Web application UI** built using **Lovable.dev** with React + Supabase Edge Functions  

This chatbot can answer domain-specific nutrition questions, cite relevant textbook content, and gracefully fallback to general AI knowledge when needed.

---

## 🚀 Live Application

- **🌍 Published App**: [https://health-quest-rag.lovable.app/](https://health-quest-rag.lovable.app/)  
- **🧱 Lovable Project**: [https://lovable.dev/projects/3775387e-479a-4992-87f1-5437114d6b68](https://lovable.dev/projects/3775387e-479a-4992-87f1-5437114d6b68)

---

## 🧩 RAG Architecture Overview

Below is the high-level flow of how the chatbot processes user queries and retrieves knowledge.

![RAG Architecture](.\readme_img\rag-architecture.svg)

---

## 🧱 Core Components

### 1. **PDF Ingestion & Chunking**
- Built **custom chunking functions** using regex and token length control (via `tiktoken`).
- Implemented multiple chunking strategies:
  - Sentence-based (20 sentences + overlap)
  - Token-capped (max 1300 tokens)
  - Hybrid strategies tested for coherence
- Stored chunk metadata: `page`, `source`, and `chunk_index`.

### 2. **Embeddings**
- Model: `BAAI/bge-small-en-v1.5` (384 dimensions)
- Generated locally via `sentence-transformers` for efficiency.
- Stored directly in Supabase table `chunks`.

### 3. **Vector Database**
- **Supabase (PostgreSQL + pgvector)** hosts embeddings and metadata.
- Created a custom table:
  ```sql
  CREATE TABLE chunks (
    id BIGSERIAL PRIMARY KEY,
    doc_id TEXT,
    chunk_index INT,
    content TEXT,
    metadata JSONB,
    embedding VECTOR(384)
  );
  ```
- Added a **cosine similarity index** using `ivfflat`.
- Defined a SQL function `match_documents()` for fast top-k retrieval.

### 4. **Retrieval & Ranking**
- User query embedded using same model.
- Compared against stored embeddings using cosine similarity.
- Returned top 12 chunks (similarity > 0.3 threshold).

### 5. **Response Generation**
- Used **Google Gemini 2.5 Flash** for text generation.
- Prompted with system context and retrieved chunks.
- Added inline citations like `[1]`, `[2]`, etc.

### 6. **Citation System**
- Maps citations to actual document chunks.
- Displays:
  - Source text snippet
  - Page number
  - Similarity score
- Hover/click to view references in popup modal.

---

## 🧰 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | React 18, TypeScript, Tailwind, shadcn/ui, Vite | Chat UI, citation rendering |
| **Backend** | Supabase Edge Functions (Deno) | RAG pipeline execution |
| **Database** | Supabase PostgreSQL + pgvector | Vector search & metadata |
| **Embeddings** | SentenceTransformer (BAAI/bge-small-en-v1.5) | Text & query vectorization |
| **LLM** | Google Gemini 2.5 Flash | Response generation |
| **PDF Parsing** | PyMuPDF | Text extraction & cleaning |
| **Orchestration** | Custom Python pipeline | Full RAG flow built manually |

---

## 🧮 RAG Pipeline Summary

| Stage | Description |
|--------|--------------|
| **1. Ingestion** | PDF parsed → cleaned → chunked |
| **2. Embedding** | Each chunk encoded into 384-dim vectors |
| **3. Storage** | Stored in Supabase `chunks` table |
| **4. Query** | User question → embedded → vector search |
| **5. Retrieval** | Top matches fetched via SQL cosine similarity |
| **6. Generation** | Context + query → Gemini LLM response |
| **7. Citation Display** | Links back to document chunks |

---

## ⚙️ Project Structure

```
.
├── ingest.py                  # PDF → chunks → embeddings → Supabase
├── supabase/
│   ├── schema.sql             # pgvector + match_documents function
│   └── functions/
│       └── rag-chat/
│           └── index.ts       # Edge Function RAG pipeline
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   └── CitationPopup.tsx
│   ├── pages/
│   │   └── Index.tsx
│   └── integrations/
│       └── supabase/client.ts
└── README.md
```

---

## 🧠 Models Used

| Model | Purpose | Provider |
|--------|----------|-----------|
| **BAAI/bge-small-en-v1.5** | Embeddings (384 dims) | Hugging Face |
| **Gemini 2.5 Flash** | Response generation | Google |

---

## 🧪 How to Run Locally

### Prerequisites
- Node.js & npm  
- Python 3.10+  
- Supabase account  
- Hugging Face & Gemini API keys

### Steps
```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd RAG-Nutrition-Chatbot

# Install frontend deps
npm install

# Run frontend
npm run dev

# (Optional) Run ingestion
pip install -r requirements.txt
python ingest.py
```

Add your credentials to `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
HUGGINGFACE_API_KEY=your_hf_key
GEMINI_API_KEY=your_gemini_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

---

## 📚 References

- [Supabase Documentation](https://supabase.com/docs)  
- [pgvector Extension](https://github.com/pgvector/pgvector)  
- [Sentence Transformers](https://www.sbert.net/)  
- [Gemini API Overview](https://ai.google.dev/)  
- [RAG Concept Overview](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

## 💡 Credits

Built entirely **from scratch** by implementing a full RAG pipeline manually,  
including chunking, embedding, retrieval, and generation — then deployed as a full-stack web app via **Lovable.dev**.

> **Built with ❤️ — RAG Nutrition Chatbot (2025)**  
> © Developed and designed by [Sarvesh Purohit]
