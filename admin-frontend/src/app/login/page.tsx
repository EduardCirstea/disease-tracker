'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useAppLoading } from '@/contexts/AppLoadingContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, error, loading } = useAuth();
  const { isInitialCheckComplete } = useAppLoading();

  useEffect(() => {
    // Actualizare eroare din context
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validare de bază
    if (!email || !password) {
      setFormError('Vă rugăm să completați toate câmpurile');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Eroarea va fi gestionată în AuthContext
    }
  };

  // Folosim un wrapper div în loc de a returna null pentru a evita modificări de DOM costisitoare
  if (!isInitialCheckComplete) {
    return <div className="opacity-0" aria-hidden="true" />; // Element invizibil în loc de null
  }

  return (
    <>
      <Head>
        <title>Admin Login | Sistem Gestionare Boli Infecțioase</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <FiLock className="mx-auto text-blue-500" size={40} />
            <h2 className="mt-4 text-3xl font-bold text-gray-800">
              Admin Login
            </h2>
            <p className="mt-2 text-gray-600">
              Conectați-vă pentru a gestiona cazurile de boli infecțioase
            </p>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
              <FiAlertCircle className="mr-2" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400"
                placeholder="Introduceți emailul"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Parolă
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400"
                placeholder="Introduceți parola"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Se procesează...' : 'Conectare'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;