import React, { InputHTMLAttributes } from "react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const CustomInput = ({label, ...inputProps}:CustomInputProps) => {
  return (
    <div className="w-80 flex flex-col text-base my-2 gap-1">
      <label className="text-xs font-thin">{label}</label>
      <input
        className="text-base border-solid h-8 rounded-md p-4 focus:border-slate-300 focus:outline-none"
        {...inputProps}
      />
    </div>
  );
};
