import { Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { IconType } from "react-icons";

export interface MenuItemsProps {
  label: React.ReactNode;
  key?: React.Key | null;
  icon?: IconType;
  path?: string;
  children?: MenuItemsProps[];
  show?: boolean;
}

interface Props {
  children: React.ReactNode;
  items: MenuItemsProps[];
}

type MenuItem = Required<MenuProps>["items"][number];

export const SideOptions = ({ children, items }: Props) => {
  const [sideBarItemsm, stateSetSideBarItemsm] = useState<MenuItem[]>([]);
  const { Sider, Content } = Layout;

  const router = useRouter();

  const activePath = useMemo(() => {
    if (router.pathname === "/") return;

    const paths = router.pathname.split("/");

    return paths[1];
  }, [router.pathname]) as string;

  function getItem({
    label,
    children,
    icon: Icon,
    show = true,
    key,
    path: to,
  }: MenuItemsProps): MenuItem | undefined {
    if (show)
      return {
        key,
        style: {
          fontSize: "16px",
          color: "#374151",
          marginBottom: 10,
        },
        icon: Icon ? (
          <Icon size={24} className="mr-1 fill-primary" />
        ) : null,
        children,
        label: to ? <Link href={to}>{label}</Link> : label,
      } as MenuItem;
  }

  useEffect(() => {
    if (items?.length === 0) return;
    const sideBarItems = items?.map((item) => {
      return getItem(item);
    });

    if (!sideBarItems) return;

    stateSetSideBarItemsm(sideBarItems as MenuItem[]);
  }, [items]);

  return (
    <Layout className="max-w-7xl w-full">
      <Sider 
        trigger={null} 
        width={250}
        style={{ }}
        >
        <div className="h-full w-full bg-background pt-10">
          <Menu
            mode="inline"
            defaultSelectedKeys={[activePath]}
            defaultOpenKeys={[activePath]}
            className=" border-none rounded-lg"
            style={{backgroundColor: '#D6D6D6', borderRight: 0, borderLeft: 0}}
            items={sideBarItemsm}
          />
        </div>
        
      </Sider>
      <Layout>
        <Content
          className={`min-h-screen relative flex justify-center items-center flex-col`}
          style={{ backgroundColor: '#D6D6D6', paddingLeft: '1rem', paddingRight: '1rem'}}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
