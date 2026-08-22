import Head from "next/head";
import { SignUpScreen } from "@/components/pages/SignUpScreen";

const Register = () => {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-transparent">
      <Head>
        <title>Cadastro</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <SignUpScreen />
    </div>
  );
};

export default Register;
