import { GenerateReplyBody } from '@/types/types';
import { OpenAIStream } from '@/utils';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { status, customerEmail, model } =
      (await req.json()) as GenerateReplyBody;

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey == null) {
      throw new Error('openai api key missing');
    }

    const stream = await OpenAIStream(status, customerEmail, model, apiKey);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
