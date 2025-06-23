# Infectious Disease Monitoring & Analytics Platform

A comprehensive healthcare platform built to monitor and analyze infectious disease outbreaks in real-time. The system provides epidemiologists and health administrators with powerful tools for case management, statistical analysis, and outbreak prediction.

## Features

- **Real-time disease case tracking and management**
- **Interactive geospatial heat maps and location markers**
- **Advanced statistical analytics and trend visualization**
- **Epidemiological modeling (SIR/SEIR) for outbreak prediction**
- **Role-based access control (Admin/Public interfaces)**
- **Temporal data analysis with configurable time intervals**
- **Multi-location disease distribution monitoring**
- **JWT-secured API with comprehensive data validation**

## Tech Stack

### Backend
- **NestJS** - Node.js framework for scalable server-side applications
- **PostgreSQL** - Robust relational database
- **TypeORM** - Object-Relational Mapping
- **JWT** - JSON Web Tokens for authentication
- **TypeScript** - Type-safe JavaScript

### Frontend
- **React 19** - Modern UI library
- **Next.js 15** - React framework with SSR
- **TypeScript** - Type-safe development
- **Mantine UI** - Component library (Admin)
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Leaflet.js** - Interactive maps

## Project Structure

```
disease-tracker/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── cases/          # Disease cases management
│   │   ├── locations/      # Geographic locations
│   │   ├── statistics/     # Analytics and reporting
│   │   └── users/          # User management
│   └── package.json
├── admin-frontend/         # Admin dashboard (Next.js)
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── user-frontend/          # Public interface (Next.js)
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EduardCirstea/disease-tracker.git
   cd disease-tracker
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with your database configuration
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   
   # Start the backend server
   npm run start:dev
   ```

3. **Setup Admin Frontend**
   ```bash
   cd admin-frontend
   npm install
   
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   
   # Start development server
   npm run dev
   ```

4. **Setup User Frontend**
   ```bash
   cd user-frontend
   npm install
   
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   
   # Start development server
   npm run dev
   ```

### Access the Application

- **Backend API**: http://localhost:5000/api
- **Admin Dashboard**: http://localhost:3000
- **Public Interface**: http://localhost:3001

## Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=infectious_diseases
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PORT=5000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Documentation

The backend provides RESTful endpoints for:

- **Authentication**: `/api/auth`
- **Cases Management**: `/api/cases`, `/api/admin/cases`
- **Locations**: `/api/locations`, `/api/admin/locations`
- **Statistics**: `/api/statistics`
- **Users**: `/api/users`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Eduard Cirstea - [@EduardCirstea](https://github.com/EduardCirstea)

Project Link: [https://github.com/EduardCirstea/disease-tracker](https://github.com/EduardCirstea/disease-tracker) 