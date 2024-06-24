import React, { ImgHTMLAttributes } from "react";
import Image from "next/image";
import { IconType } from "react-icons";
import Link from "next/link";

export interface TopicProps {
  icon: string;
  title: string;
  link: string
}

export const ForumTopic = (item: TopicProps) => {
  return (
    <Link href={item.link} className="md:w-64 w-full h-32">
    <button className="md:w-64 w-full h-32 rounded-md bg-whiteColor flex flex-col justify-around py-2 items-center shadow-lg hover:bg-slate-400 transition-transform transform hover:scale-105">
      <Image
        className="rounded-full"
        src={item.icon}
        alt={item.title + 'from StorySet'}
        width={60}
        height={60}
      />
      <h2 className="font-bold text-lg text-primary">{item.title}</h2>
    </button>
    </Link>
    
  );
};
