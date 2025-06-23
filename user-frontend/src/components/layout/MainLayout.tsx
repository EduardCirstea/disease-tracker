"use client";

import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'Monitorizare Boli Infecțioase',
  description = 'Platformă pentru monitorizarea și vizualizarea cazurilor de boli infecțioase',
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="flex-grow bg-gray-50">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout; 