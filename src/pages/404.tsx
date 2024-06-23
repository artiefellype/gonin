// pages/404.tsx
import { NextPage } from 'next';
import Link from 'next/link';

const Custom404: NextPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Página Não Encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <Link href="/">
        <p>Voltar para a Home</p>
      </Link>
    </div>
  );
};

export default Custom404;
