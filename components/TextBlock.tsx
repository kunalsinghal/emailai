import React, { useEffect, useState } from 'react';

interface Props {
  text: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  quickInserts?: boolean
}

export const TextBlock: React.FC<Props> = ({
  text,
  editable = false,
  onChange = () => {},
  quickInserts = false
}) => {
  // Function to generate and set random text
  const generateRandomText = () => {
    
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    const newText = randomMessages[randomIndex];
    if (text === newText) {
      generateRandomText();
    } else {
      onChange(randomMessages[randomIndex]);
    }
  };

  useEffect(() => {
    if (quickInserts && text === '') {
      generateRandomText();
    }
  });

  // Handler for onChange event
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className='py-4'>
      {quickInserts && <button
        className="bg-blue-500 text-sm text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none mb-2"
        onClick={generateRandomText}
      >
        Prefill customer email
      </button>}
      <textarea
        className="min-h-[500px] w-full bg-[#1A1B26] p-4 text-[15px] text-neutral-200 focus:outline-none"
        style={{ resize: 'none' }}
        value={text}
        onChange={handleTextChange}
        disabled={!editable}
      />
    </div>
  );
};

const randomMessages = [
  "Hi, I'm a small business owner and I need help with my taxes. I'm not sure what I need to do. Can you help me?",
  "Hi, it's been two weeks, how long does it take to get my taxes done? I'm getting worried.",
  "Thanks for the quick filing! I'll be sure to recommend you to my friends.",
];