import React from 'react';
import Head from 'next/head';
import MainLayout from '../../components/layout/MainLayout';
import CaseForm from '../../components/cases/CaseForm';

const CreateCasePage: React.FC = () => {
  return (
    <MainLayout>
      <Head>
        <title>Adaugă Caz Nou | Sistem Gestionare Boli Infecțioase</title>
      </Head>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Adaugă Caz Nou</h1>
      </div>
      
      <CaseForm />
    </MainLayout>
  );
};

export default CreateCasePage;