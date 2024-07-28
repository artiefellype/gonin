import { CustomInput } from "@/components/atoms/CustomInput";
import { title } from "process";
import React, { FormEvent, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  title: string;
}

export interface AuthFormProps {
  formTitle: string;
  handleSubmit: (e: FormEvent) => Promise<void>;
  inputArray: InputProps[];
  error: string;
  OnSubmitLoading: boolean;
  isRegistered?: boolean;
}
export const AuthForm = ({
  formTitle,
  OnSubmitLoading,
  error,
  handleSubmit,
  inputArray,
  isRegistered = false,
}: AuthFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="w-full lg:max-w-[320px]">
      {inputArray.map((item, idx) => (
        <CustomInput label={item.title} {...item} key={idx}/>
      ))}

      {error && <p className="text-red-500 text-[12px] px-2">{error}</p>}

      {!isRegistered && (
        <button
          type="submit"
          className="border-slate-600 mt-4 text-base lg:max-w-[320px] border-solid border-2 w-full h-11 rounded-3xl flex flex-row justify-center items-center gap-2 hover:text-slate-900 hover:bg-slate-300 transition-all duration-400 ease-in-out font-semibold"
          disabled={OnSubmitLoading}
        >
          {!OnSubmitLoading ? (
            formTitle
          ) : (
            <div className="flex items-center justify-center h-screen">
              <div className="w-6 h-6 border-4 border-t-slate-600 border-r-slate-600 border-b-slate-100 border-l-slate-100 rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      )}

      {isRegistered && (
        <div className="border-green-400 mt-4 text-base lg:max-w-[320px] border-solid border-2 w-full h-11 rounded-3xl flex flex-row justify-center items-center gap-2 transition-all duration-400 ease-in-out font-semibold bg-green-400">
          ✅
        </div>
      )}
    </form>
  );
};
