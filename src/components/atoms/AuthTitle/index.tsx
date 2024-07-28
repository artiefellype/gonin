import React from "react";

export interface AuthTitleProps {
  title: string;
  description: string;
}
export const AuthTitle = ({ title, description }: AuthTitleProps) => {
  return (
    <div className="w-full pb-12 flex justify-center flex-col lg:justify-start">
      <h1 className="text-3xl font-bold ">{title}</h1>
      <p className="text-base font-light pl-1"> {description}</p>
    </div>
  );
};
