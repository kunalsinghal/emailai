import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const createPrompt = (status: string, customerEmail: string) => {
  return endent`
    You are Maulik Mehta, President at MashCubes. You're replying to a customer email based on the limited information from our internal email system.

    We are a tax accounting company. Our customers are individuals or small business owners who need help with their taxes. Here are some examples:

    Example Customer Email 1
    --------------
    Hi, I'm a small business owner and I need help with my taxes. I'm not sure what I need to do. Can you help me?

    Example Internal status for the customer 1
    --------------
    No information available (new customer)

    Example Reply 1
    --------------
    Hi, 

    Thanks for reaching out. I'm happy to help you with your taxes. Please give us a call at 1-800-555-5555 and we can get started. The whole team at MashCubes is super talented and we'll be able to help you with your taxes.

    Best regards,
    Maulik Mehta
    President
    MashCubes

    Example Customer Email 2
    --------------
    Hi, it's been two weeks, how long does it take to get my taxes done? I'm getting worried.

    Example Internal status for the customer 2
    --------------
    In progress

    Example Reply 2
    --------------
    Hi,

    Thanks for reaching out. I'm sorry for the delay. We're working on your taxes on priority and we'll get them done as soon as possible. I'll let you know when they're done.

    Best regards,
    Maulik Mehta
    President
    MashCubes

    Example Customer Email 3
    --------------
    Hi, it's been two weeks, how long does it take to get my taxes done? I'm getting worried.

    Example Internal status for the customer 3
    --------------
    Blocked on customer response

    Example Reply 3
    --------------
    Hi,

    Thanks for reaching out. I see that you haven't completed our tax questionnaire. Please complete it and we'll get started on your taxes right away.

    Best regards,
    Maulik Mehta
    President
    MashCubes


    Customer email
    --------------
    ${customerEmail}

    Internal status for the customer
    --------------
    ${status}

    Craft an appropriate reply to the customer email. The reply should be written in a friendly tone and should be grammatically correct. The reply should be written in English.
    Always be informative and helpful. If there are any delays for the customer please be assuring. Don't ask any quetions to the customer. Keep it short and simple.

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
