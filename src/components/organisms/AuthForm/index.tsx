import { CustomInput } from "@/components/atoms/CustomInput";
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
    <form onSubmit={handleSubmit} className="w-full max-w-[320px]">
      {inputArray.map((item, idx) => (
        <CustomInput label={item.title} {...item} key={idx} />
      ))}

      {error && <p className="text-red-500 text-xs px-2">{error}</p>}

      {!isRegistered && (
        <button
          type="submit"
          className="mt-4 flex h-10 w-full max-w-[320px] flex-row items-center justify-center gap-2 rounded-full border-2 border-solid border-accent bg-accent text-base font-semibold text-whiteColor transition-all duration-400 ease-in-out hover:bg-primary"
          disabled={OnSubmitLoading}
        >
          {!OnSubmitLoading ? (
            formTitle
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-4 border-t-whiteColor border-r-whiteColor border-b-slate-500 border-l-slate-500 rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      )}

      {isRegistered && (
        <div className="border-green-400 mt-4 text-base lg:max-w-[320px] border-solid border-2 w-full h-11 rounded-3xl flex flex-row justify-center items-center gap-2 transition-all duration-400 ease-in-out font-semibold bg-green-400">
          OK
        </div>
      )}
    </form>
  );
};
