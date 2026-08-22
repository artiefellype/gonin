import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaLock, FaUsers } from "react-icons/fa6";

export interface TopicProps {
  icon: string;
  title: string;
  link: string;
  description?: string;
  membersCount?: number;
  isPrivate?: boolean;
}

export const ForumTopic = (item: TopicProps) => {
  return (
    <Link
      href={item.link}
      className="group flex min-h-[156px] w-full flex-col justify-between overflow-hidden rounded-xl border border-borderDark bg-panel/90 p-4 shadow-lg transition-colors hover:border-accent md:min-h-[168px] md:rounded-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
          {item.icon ? (
            <Image
              className="h-full w-full object-cover"
              src={item.icon}
              alt={item.title}
              width={56}
              height={56}
              loading="lazy"
            />
          ) : (
            <span className="text-xl font-semibold text-accent">
              {item.title.slice(0, 1)}
            </span>
          )}
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-borderDark text-mutedText transition-colors group-hover:border-accent group-hover:text-accent">
          <FaArrowRight size={14} />
        </span>
      </div>
      <div>
        <div className="mt-4 flex items-center gap-2">
          <h2 className="min-w-0 truncate text-base font-semibold leading-6 text-primary sm:text-lg">
            {item.title}
          </h2>
          {item.isPrivate && (
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accentSoft text-accent">
              <FaLock size={10} />
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-mutedText">
          {item.description || "Conversas abertas para este assunto."}
        </p>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-mutedText">
          <FaUsers size={12} />
          {item.membersCount || 0} membros
        </p>
      </div>
    </Link>
  );
};
