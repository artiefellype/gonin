import Head from "next/head";
import { SignUpScreen } from "@/components/pages/SignUpScreen";

const Register = () => {
  return (
    <div className="flex min-h-screen bg-background justify-center items-center">
      <Head>
        <title>Cadastro</title>
      </Head>
      <SignUpScreen />
    </div>
  );
};

export default Register;
