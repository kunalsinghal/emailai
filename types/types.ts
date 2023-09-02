export type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4';

export interface GenerateReplyBody {
  status: string;
  customerEmail: string;
  model: OpenAIModel;
}

export interface GenerateReplyResponse {
  email: string;
}
