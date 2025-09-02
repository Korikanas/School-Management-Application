import { useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';


const ReactHookForm = dynamic(() => import('./ReactHookFormComponent'), {
  ssr: false,
  loading: () => (
    <div className="form">
      <div className="loading-form">Loading form...</div>
      <style jsx>{`
        .form {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .loading-form {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          font-size: 18px;
          color: #6b7280;
        }
      `}</style>
    </div>
  )
});

export default function AddSchoolForm() {
  return <ReactHookForm />;

}
