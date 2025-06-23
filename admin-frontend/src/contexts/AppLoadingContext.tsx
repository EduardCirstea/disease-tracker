'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface AppLoadingContextType {
  isAppLoading: boolean;
  setAppLoading: (loading: boolean) => void;
  setInitialCheckComplete: (complete: boolean) => void;
  isInitialCheckComplete: boolean;
}

const AppLoadingContext = createContext<AppLoadingContextType | undefined>(undefined);

export const AppLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Funcția de setare a stării de încărcare cu debounce pentru a preveni actualizări rapide
  const setAppLoading = (loading: boolean) => {
    // Dacă setăm loading=false, aplicăm un mic delay pentru a ne asigura că tranziția este fluidă
    if (!loading) {
      // Curățăm orice timer anterior pentru a evita stări contradictorii
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        setIsAppLoading(false);
        timerRef.current = null;
      }, 300);
    } else {
      // Dacă setăm loading=true, aplicăm imediat
      setIsAppLoading(true);
    }
  };

  const setInitialCheckComplete = (complete: boolean) => {
    setIsInitialCheckComplete(complete);
  };
  
  // Curățăm timeout-ul la demontare
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <AppLoadingContext.Provider
      value={{
        isAppLoading,
        setAppLoading,
        isInitialCheckComplete,
        setInitialCheckComplete,
      }}
    >
      {children}
      {isAppLoading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700">Se încarcă aplicația...</p>
          </div>
        </div>
      )}
    </AppLoadingContext.Provider>
  );
};

export const useAppLoading = (): AppLoadingContextType => {
  const context = useContext(AppLoadingContext);
  if (!context) {
    throw new Error('useAppLoading trebuie folosit în interiorul unui AppLoadingProvider');
  }
  return context;
}; 