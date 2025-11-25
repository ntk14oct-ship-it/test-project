export interface PeaLocationResult {
  officeName: string;
  province: string;
  district?: string;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
  suggestedAction: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isProcessing?: boolean;
  result?: PeaLocationResult;
  mapLinks?: string[];
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        text: string;
        author: string;
      }[];
    };
  };
  web?: {
    uri: string;
    title: string;
  };
}