import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MainLayout from '../../../components/layout/MainLayout';
import CaseForm from '../../../components/cases/CaseForm';

const EditCasePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  return (
    <MainLayout>
      <Head>
        <title>Editează Caz | Sistem Gestionare Boli Infecțioase</title>
      </Head>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editează Caz</h1>
      </div>
      
      {id && <CaseForm caseId={id as string} isEditMode={true} />}
    </MainLayout>
  );
};
export default EditCasePage;
