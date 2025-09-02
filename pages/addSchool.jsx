import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AddSchoolForm from '../components/AddSchoolForm';

export default function AddSchoolPage() {
  return (
    <div className="container">
      <Head>
        <title>Add School</title>
        <meta name="description" content="Add a new school to the database" />
      </Head>

      <div className="card">
        <div className="card-header">
          <h1>Add New School</h1>
          <p>Fill in the details below to register a new school</p>
        </div>
        <AddSchoolForm />
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px 20px;
          min-height: 100vh;
        }
        
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .card-header {
          padding: 30px 30px 20px;
          border-bottom: 1px solid #eaedf0;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
        }
        
        .card-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 700;
        }
        
        .card-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
        }
      `}</style>
    </div>
  );

}
