import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
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
  const cookies = parseCookies(ctx);

  if (!cookies.token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }else {
    return {
      redirect: {
        destination: '/forum',
        permanent: false,
      },
    };
  }
};

