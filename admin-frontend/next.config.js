/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Optimizare pentru fișierele mari
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      },
    };

    // În mod dezvoltare, dezactivează complet cache-ul webpack
    if (dev) {
      // Dezactivare completă a cache-ului webpack în dezvoltare pentru a evita avertismentele
      config.cache = false;

      // Dezactivează complet memorization cache
      config.optimization.usedExports = false;

      // Dezactivează analizele de mărime
      config.performance = {
        ...config.performance,
        hints: false,
      };
    } else {
      // În producție, folosim cache-ul pentru viteză, dar cu optimizări
      if (config.cache) {
        config.cache = {
          ...config.cache,
          memoryCacheUnaffected: true,
          version: config.cache.version + '-buffer-strings-fixed'
        };
      }
    }
    
    // Adăugăm flag-uri pentru a gestiona mai bine avertismentele webpack
    if (dev) {
      config.infrastructureLogging = {
        ...config.infrastructureLogging,
        level: 'none', // Dezactivează complet logurile de infrastructură
      };

      // Dezactivează toate avertismentele webpack
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        if (args.length > 0 && 
            typeof args[0] === 'string' && 
            (args[0].includes('webpack') || 
             args[0].includes('cache') || 
             args[0].includes('serialization'))) {
          return;
        }
        originalConsoleWarn(...args);
      };
    }

    return config;
  },
  // Dezactivează compresia pentru o mai bună performanță în dezvoltare
  compress: process.env.NODE_ENV === 'production',
  // Optimizează încărcarea imaginilor
  images: {
    minimumCacheTTL: 60,
  },
  // Alte opțiuni pentru performanță Next.js
  reactStrictMode: true,
  swcMinify: true, // Folosește SWC minifier pentru o compilare mai rapidă
  // Configurare pentru a reduce logarea
  onDemandEntries: {
    // Timpul în care paginile sunt păstrate în memorie
    maxInactiveAge: 60 * 1000, // 60 secunde
    // Numărul de pagini care vor fi ținute în memorie
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig; 