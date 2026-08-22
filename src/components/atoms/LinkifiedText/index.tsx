import React from "react";

interface LinkifiedTextProps {
  text?: string;
}

const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const trailingPunctuationRegex = /[),.!?;:]+$/;

const getSafeHref = (url: string) => {
  const href = url.toLowerCase().startsWith("www.") ? `https://${url}` : url;

  try {
    const parsedUrl = new URL(href);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return "";
    return parsedUrl.href;
  } catch {
    return "";
  }
};

export const LinkifiedText = ({ text = "" }: LinkifiedTextProps) => {
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part.match(urlRegex)) return <React.Fragment key={index}>{part}</React.Fragment>;

        const trailingPunctuation = part.match(trailingPunctuationRegex)?.[0] || "";
        const cleanUrl = trailingPunctuation
          ? part.slice(0, -trailingPunctuation.length)
          : part;
        const href = getSafeHref(cleanUrl);

        if (!href) return <React.Fragment key={index}>{part}</React.Fragment>;

        return (
          <React.Fragment key={index}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-semibold text-accent underline-offset-2 hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {cleanUrl}
            </a>
            {trailingPunctuation}
          </React.Fragment>
        );
      })}
    </>
  );
};
