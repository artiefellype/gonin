import { GetServerSideProps } from "next";
import { Fragment } from "react";

export default function LandPage() {
  return (
    <Fragment>
      <h1>Aqui Haverá uma LandPage, Duvido muito</h1>
    </Fragment>
  );
}

// AUTHENTICAÇÂO A NIVEL DE SERVER SIDE
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
