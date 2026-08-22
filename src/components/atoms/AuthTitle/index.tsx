import React from "react";

export interface AuthTitleProps {
  title: string;
  description: string;
}
export const AuthTitle = ({ title, description }: AuthTitleProps) => {
  return (
    <div className="flex w-full flex-col justify-center pb-6 sm:pb-8 lg:justify-start">
      <h1 className="text-2xl font-semibold text-primary">{title}</h1>
      <p className="mt-2 text-sm font-normal leading-6 text-mutedText sm:text-base">{description}</p>
    </div>
  );
};
