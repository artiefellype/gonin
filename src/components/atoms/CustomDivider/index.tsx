import { getTitleFromTag } from "@/services/utils/mappers";
import React from "react";

interface DividerProps {
  tag: string;
}

export const CustomDivider = ({ tag }: DividerProps) => {
  return (
    <div className="w-full rounded-xl border border-borderDark bg-panel/90 p-4 md:rounded-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-accent">
        Comunidade
      </p>
      <h2 className="mt-1 text-xl font-semibold text-primary sm:text-2xl">
        {getTitleFromTag(tag)}
      </h2>
    </div>
  );
};
