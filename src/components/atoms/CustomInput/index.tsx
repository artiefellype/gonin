import React, { InputHTMLAttributes } from "react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const CustomInput = ({ label, ...inputProps }: CustomInputProps) => {
  return (
    <div className="w-full flex flex-col text-base my-2 gap-1">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-slate-500 focus:outline-none"
        {...inputProps}
      />
    </div>
  );
};
