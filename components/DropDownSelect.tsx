import type { FC } from 'react';

interface Props {
  language: string;
  onChange: (language: string) => void;
  options: typeof statusOptions;
}

export const DropDownSelect: FC<Props> = ({ language, onChange, options }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      className="w-full rounded-md bg-[#1F2937] px-4 py-2 text-neutral-200"
      value={language}
      onChange={handleChange}
    >
      {options
        .map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
    </select>
  );
};

export const statusOptions = [
  { value: 'No information available (new customer)', label: 'No information available (new customer)' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Blocked on customer response', label: 'Blocked on customer response' },
  { value: 'Internal delays', label: 'Internal delays' },
  { value: 'Pending tax payment', label: 'Pending tax payment' },
];
