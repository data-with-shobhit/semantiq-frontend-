export type Domain = 'general' | 'financial' | 'legal' | 'medical' | 'clinical' | 'scientific' | 'technical';

export interface Workspace {
  id: number;
  name: string;
  domain: Domain;
  embed_model: string;
  embed_dim: number;
  collection_name: string;
  storage_mb: number;
  created_at: string;
}

export interface Document {
  id: number;
  filename: string;
  status: 'processing' | 'ready' | 'failed';
  chunk_count: number | null;
  uploaded_at: string;
}

export interface Chunk {
  text: string;
  score?: number;
  rerank_score?: number;
  web?: boolean;
  source?: string;
  payload?: { doc_id?: number; section?: string; chunk_index?: number };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chunks?: Chunk[];
  meta?: { latency_ms: number; llm_calls: number; cached: boolean };
  timestamp: number;
}

export interface Strategy {
  strategy_id: number;
  doc_id: number;
  filename: string;
  version: number;
  name: string | null;
  chunker: string;
  chunk_size: number;
  overlap: number;
  reasoning: string | null;
  source: string;
  ragas_scores: Record<string, number> | null;
  is_active: boolean;
  created_at: string;
}

export interface EvalResult {
  eval_id: number;
  faithfulness: number;
  context_precision: number;
  answer_relevance: number;
  avg_score: number;
  retrieval_metrics: Record<string, number>;
  n_questions: number;
  created_at: string;
}
