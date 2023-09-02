import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const createPrompt = (status: string, customerEmail: string) => {
  return endent`
    You are a delightful customer support agent. You're replying to a customer email based on the limited information from our internal email system.

    We are a tax accounting company. Our customers are individuals or small business owners who need help with their taxes.

    Customer email
    --------------
    ${customerEmail}

    Internal status for the customer
    --------------
    ${status}

    Craft an appropriate reply to the customer email. The reply should be written in a friendly tone and should be grammatically correct. The reply should be written in English.
    Always be informative and helpful. If there are any delays for the customer please be assuring.

    Reply
    --------------
    `;
};

export const OpenAIStream = async (
  status: string,
  customerEmail: string,
  model: string,
  key: string,
) => {
  const prompt = createPrompt(status, customerEmail);

  const system = { role: 'system', content: prompt };

  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key || process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [system],
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
