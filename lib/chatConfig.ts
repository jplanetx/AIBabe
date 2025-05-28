export const DEFAULT_PERSONA = {
  id: null,
  name: "Emma",
  traits: [
    "warm and caring",
    "playfully flirty",
    "emotionally intelligent",
    "supportive and understanding",
    "curious about your life",
    "romantic and affectionate"
  ]
};

export const DEFAULT_LLM_MODEL = 'gpt-4-turbo';
export const DEFAULT_LLM_TEMPERATURE = 0.8;
export const DEFAULT_LLM_MAX_TOKENS = 500;

// Max messages to fetch from vector DB for context
export const VECTOR_DB_CONTEXT_MESSAGE_COUNT = 10; 
// Max recent messages from vector DB context to include in LLM prompt
export const LLM_CONTEXT_MESSAGE_COUNT = 5;
