# RAG Chatbot - Human Nutrition Assistant

## 🚀 Live Application

**Published URL**: [Coming Soon - Add your published URL here]

**Lovable Project**: https://lovable.dev/projects/3775387e-479a-4992-87f1-5437114d6b68

## 📋 Project Overview

This is a **Retrieval-Augmented Generation (RAG)** chatbot application specialized in human nutrition. The system combines document retrieval with AI generation to provide accurate, context-aware responses with clickable citations.

### What This Application Does

- **Document Q&A**: Answers questions based on a human nutrition textbook PDF
- **Semantic Search**: Uses vector embeddings to find relevant document chunks
- **Smart Responses**: Combines retrieved context with AI knowledge
- **Citation System**: Provides clickable citations with source text, page numbers, and similarity scores
- **Conversational AI**: Handles casual conversations and greetings naturally
- **Fallback Knowledge**: Uses AI's pre-trained knowledge when document context isn't relevant

## 🤖 AI Models Used

### 1. **Embedding Model**: BAAI/bge-small-en-v1.5
- **Provider**: Hugging Face
- **Purpose**: Converts user queries and document chunks into vector embeddings
- **Dimensions**: 384-dimensional vectors
- **Used for**: Semantic similarity search in vector database

### 2. **Generation Model**: Gemini 2.5 Flash
- **Provider**: Google
- **Purpose**: Generates natural language responses based on retrieved context
- **Features**: 
  - Multimodal capabilities
  - Large context window
  - Fast inference
  - Temperature: 0.2 (for consistent, factual responses)

## 🏗️ RAG Pipeline Architecture

<lov-mermaid>
graph TB
    A[User Query] --> B[Edge Function: rag-chat]
    B --> C[Generate Query Embedding<br/>BAAI/bge-small-en-v1.5<br/>Hugging Face API]
    C --> D[Vector Search<br/>Supabase pgvector]
    D --> E{Similarity > 0.3?}
    
    E -->|Yes - Relevant Context| F[Format Context<br/>with Page Numbers]
    E -->|No - Not Relevant| G[Use General Knowledge Mode]
    
    F --> H[Build System Prompt<br/>+ Context + User Query]
    G --> I[Build System Prompt<br/>+ User Query Only]
    
    H --> J[Generate Response<br/>Gemini 2.5 Flash]
    I --> J
    
    J --> K[Return Answer<br/>+ Citation Sources]
    K --> L[Frontend Rendering]
    L --> M[Parse Citations [1], [2]]
    M --> N[Display Clickable Citations]
    
    style A fill:#e1f5ff
    style C fill:#fff3cd
    style D fill:#d4edda
    style J fill:#f8d7da
    style N fill:#d1ecf1
</lov-mermaid>

## 🔧 Technical Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Vite** - Build tool

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with pgvector extension
  - Edge Functions (Deno runtime)
  - Vector similarity search
- **Hugging Face API** - Embedding generation
- **Google Gemini API** - Text generation

### Key Features

#### Vector Database
- **Table**: `chunks`
- **Columns**: 
  - `content`: Text content
  - `embedding`: 384-dim vector
  - `metadata`: JSON (page, source)
  - `doc_id`: Document identifier
  - `chunk_index`: Position in document
- **Function**: `match_documents()` - Cosine similarity search

#### Citation System
- Extracts `[1]`, `[2]`, etc. from AI responses
- Maps citation numbers to source chunks
- Shows popup with:
  - Source text content
  - Page number
  - Similarity score
  - Document reference

#### Smart Context Handling
- **Threshold**: 0.3 similarity score
- **Above threshold**: Uses document context + citations
- **Below threshold**: Falls back to general AI knowledge
- **Match count**: Retrieves top 12 similar chunks

## 📁 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx      # Main chat UI
│   │   ├── ChatMessage.tsx        # Message rendering with citations
│   │   └── CitationPopup.tsx      # Citation detail modal
│   ├── pages/
│   │   └── Index.tsx              # Home page
│   └── integrations/
│       └── supabase/
│           └── client.ts          # Supabase client
├── supabase/
│   └── functions/
│       └── rag-chat/
│           └── index.ts           # RAG pipeline edge function
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account
- Hugging Face API key
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Add to .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

4. **Configure Supabase secrets**
- `HUGGINGFACE_API_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

5. **Start development server**
```bash
npm run dev
```

## 📊 How It Works

### 1. Document Ingestion (Preprocessing)
- PDF documents are chunked into smaller segments
- Each chunk is embedded using BAAI/bge-small-en-v1.5
- Embeddings stored in Supabase with metadata (page, source)

### 2. Query Processing
- User sends a question
- Query is embedded using the same model
- Vector similarity search finds top 12 relevant chunks

### 3. Context Augmentation
- If similarity > 0.3: Build context from chunks with page numbers
- System prompt instructs AI to cite sources as `[1]`, `[2]`, etc.
- Full conversation context passed to Gemini

### 4. Response Generation
- Gemini generates response with citations
- Frontend parses citation markers
- Clickable citations linked to source chunks

### 5. Citation Display
- Click `[1]` → Opens popup with:
  - Full source text
  - Page number
  - Similarity score
  - Document filename

## 🎨 Features

- ✅ Semantic search with vector embeddings
- ✅ Context-aware responses with citations
- ✅ Clickable source references
- ✅ Fallback to general AI knowledge
- ✅ Natural conversation handling
- ✅ Real-time chat interface
- ✅ Clean, responsive UI
- ✅ Supabase edge function backend

## 🛠️ Development

### Edit with Lovable
Visit the [Lovable Project](https://lovable.dev/projects/3775387e-479a-4992-87f1-5437114d6b68) and start prompting.

### Edit with Your IDE
Make changes locally and push to the repository. Changes will sync with Lovable automatically.

### Deploy
Open [Lovable](https://lovable.dev/projects/3775387e-479a-4992-87f1-5437114d6b68) and click **Share → Publish**.

## 📚 Technologies Used

- **Vite** - Build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **Supabase** - Backend & database
- **PostgreSQL + pgvector** - Vector database
- **Hugging Face** - Embedding API
- **Google Gemini** - LLM API

## 📖 Learn More

- [Lovable Documentation](https://docs.lovable.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [RAG Overview](https://www.pinecone.io/learn/retrieval-augmented-generation/)

## 🤝 Contributing

This project is built with Lovable. Feel free to fork and customize for your needs!

---

**Built with ❤️ using Lovable**
