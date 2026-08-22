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

      {error && <p className="px-2 text-xs font-medium text-coral">{error}</p>}

      {!isRegistered && (
        <button
          type="submit"
          className="mt-4 flex h-11 w-full max-w-[320px] flex-row items-center justify-center gap-2 rounded-lg border border-accent bg-accent text-base font-bold text-background transition-all duration-300 ease-in-out hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={OnSubmitLoading}
        >
          {!OnSubmitLoading ? (
            formTitle
          ) : (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-background/20 border-t-background"></div>
            </div>
          )}
        </button>
      )}

      {isRegistered && (
        <div className="mt-4 flex h-11 w-full flex-row items-center justify-center gap-2 rounded-lg border border-accent bg-accentSoft text-base font-semibold text-accent transition-all duration-300 ease-in-out lg:max-w-[320px]">
          OK
        </div>
      )}
    </form>
  );
};
