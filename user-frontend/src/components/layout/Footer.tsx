"use client";

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Monitorizare Boli Infecțioase</h3>
            <p className="text-sm text-gray-300">
              Platformă pentru monitorizarea și vizualizarea cazurilor de boli infecțioase în România.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Navigare</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-white">
                  Acasă
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="text-sm text-gray-300 hover:text-white">
                  Statistici
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-gray-300 hover:text-white">
                  Hartă
                </Link>
              </li>
              <li>
                <Link href="/cases" className="text-sm text-gray-300 hover:text-white">
                  Cazuri
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white">
                  Despre
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Resurse utile</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.ms.ro/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Ministerul Sănătății
                </a>
              </li>
              <li>
                <a 
                  href="https://www.who.int/ro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Organizația Mondială a Sănătății
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ecdc.europa.eu/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Centrul European de Prevenire a Bolilor
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Monitorizare Boli Infecțioase. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;