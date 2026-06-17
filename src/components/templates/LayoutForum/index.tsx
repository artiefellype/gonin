import {
  MenuItemsProps,
  SideOptions,
} from "@/components/molecules/SideOptions";
import { Layout } from "antd";
import React from "react";
import { HiHome } from "react-icons/hi";
import { FaComments } from "react-icons/fa";
import { ForumHeader } from "@/components/molecules/ForumHeader";
import { ForumFooter } from "@/components/molecules/ForumFooter";
import Head from "next/head";

const { Content } = Layout;

interface Props {
  children: React.ReactNode;
}

export const LayoutForum = ({ children }: Props) => {
  const items: MenuItemsProps[] = [
    {
      label: "INÍCIO",
      icon: HiHome,
      key: "forum",
      path: `/forum`,
      show: true,
    },
    {
      label: "TÓPICOS",
      icon: FaComments,
      key: "topics",
      path: `/topics`,
      show: true,
    },
  ];

  return (
    <Layout>
      <Head>
        <title>Gonin</title>
      </Head>
      <div className="hidden w-screen flex-col items-center bg-background md:flex">
        <ForumHeader isMobile={false} />
        <SideOptions items={items}>{children}</SideOptions>
      </div>
      <div className="flex w-screen flex-col items-center bg-background md:hidden">
        <ForumHeader isMobile={true} />
        <Layout>
          <Content
            className="relative flex min-h-screen flex-col items-center justify-start pb-16 md:hidden"
            style={{
              backgroundColor: "#F1EBDD",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
            }}
          >
            {children}
          </Content>
        </Layout>
        <ForumFooter />
      </div>
    </Layout>
  );
};
