import React from "react";

type TextareaProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
  name?: string;
};

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  rows = 4,
  className = "",
  name,
}: TextareaProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed resize-vertical"
      />
    </div>
  );
}
