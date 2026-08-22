import React, { InputHTMLAttributes } from "react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  helperTone?: "default" | "success" | "danger";
}

const helperToneStyles = {
  default: "text-mutedText",
  success: "text-accent",
  danger: "text-coral",
};

export const CustomInput = ({
  label,
  helperText,
  helperTone = "default",
  ...inputProps
}: CustomInputProps) => {
  return (
    <div className="my-2 flex w-full flex-col gap-1 text-base">
      <label className="text-xs font-semibold text-mutedText">{label}</label>
      <input
        className="h-11 w-full rounded-lg border border-borderDark bg-secondary px-4 text-base text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none"
        {...inputProps}
      />
      {helperText && (
        <p className={`px-1 text-xs font-semibold ${helperToneStyles[helperTone]}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
