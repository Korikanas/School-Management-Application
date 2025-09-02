import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
   
    router.push('/showSchools');
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Schools Directory</title>
        <meta name="description" content="Schools Management System" />
      </Head>
      
      <div className="loading">
        <p>Redirecting to Schools Directory...</p>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .loading {
          text-align: center;
        }
      `}</style>
    </div>
  );

}
