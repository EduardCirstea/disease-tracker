import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { AppLoadingProvider } from '@/contexts/AppLoadingContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Tema personalizată pentru Mantine
const theme = createTheme({
  primaryColor: 'blue',
  components: {
    Select: {
      styles: {
        item: {
          '&[data-selected]': {
            backgroundColor: '#3b82f6', // Albastru
            color: 'white',
            '&:hover': {
              backgroundColor: '#2563eb', // Albastru inchis
            },
          },
          '&[data-hovered]': {
            backgroundColor: '#f0f9ff', // Albastru deschis
          },
        },
        dropdown: {
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export const metadata: Metadata = {
  title: "Sistem Gestionare Boli Infecțioase",
  description: "Platformă pentru monitorizarea și gestionarea cazurilor de boli infecțioase",
};

// Folosim o componentă separată pentru a memora MantineProvider și AppLoadingProvider
// Aceasta previne recrearea acestora la fiecare navigare
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <AppLoadingProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AppLoadingProvider>
    </MantineProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <head>
        {/* Fix pentru Leaflet icon care nu se încarcă corect în producție */}
        <style>{`
          .leaflet-default-icon-path {
            background-image: url(https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png) !important;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
