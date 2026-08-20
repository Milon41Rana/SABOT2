export interface MessageImage {
  id: string;
  data: string; // base64
  name: string;
  mimeType: string;
  size?: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: MessageImage[];
  timestamp: number;
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
  isStreaming?: boolean;
  error?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  systemPrompt: string;
  iconName: string;
  badgeColor: string;
  suggestedStarters: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  personaId: string;
  customSystemPrompt?: string;
  useSearch: boolean;
  model: string;
  temperature: number;
  isPinned?: boolean;
}

export interface AppSettings {
  defaultModel: string;
  defaultUseSearch: boolean;
  defaultTemperature: number;
  defaultPersonaId: string;
  autoScroll: boolean;
  speechVoiceName?: string;
  speechRate: number;
  soundEffects: boolean;
  sendOnEnter: boolean;
}
