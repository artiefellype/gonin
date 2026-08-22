import React, { InputHTMLAttributes } from "react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const CustomInput = ({ label, ...inputProps }: CustomInputProps) => {
  return (
    <div className="my-2 flex w-full flex-col gap-1 text-base">
      <label className="text-xs font-semibold text-mutedText">{label}</label>
      <input
        className="h-11 w-full rounded-lg border border-borderDark bg-secondary px-4 text-base text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none"
        {...inputProps}
      />
    </div>
  );
};
