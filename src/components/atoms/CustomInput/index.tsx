import React, { InputHTMLAttributes } from "react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const CustomInput = ({label, ...inputProps}:CustomInputProps) => {
  return (
    <div className="w-full flex flex-col text-base my-2">
      <label className="text-[12px] px-2 font-thin">{label}</label>
      <input
        className="text-base border-solid h-11 rounded-3xl p-4 focus:border-slate-300 focus:outline-none"
        {...inputProps}
      />
    </div>
  );
};
