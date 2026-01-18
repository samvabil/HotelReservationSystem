# Level Up Lounge Hotel Reservation System

A full-stack hotel reservation platform built with Spring Boot, React, and MongoDB. The system handles hotel room bookings for guests and provides an administrative interface for hotel staff. The system includes user authentication, room management, reservation handling, and integrated payment processing via Stripe. The platform features a gaming-inspired UI with vibrant colors, interactive elements, and a modern aesthetic designed to create an engaging and immersive booking experience. 

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Development Team](#development-team)

## Features

### User Management
- OAuth2 authentication with Google for guest users
- Basic authentication for employee users
- Role-based access control (Guest, Employee, Admin)

### Room Management
- Add, edit, and delete room types with pricing
- Track individual room status and availability
- Set maximum capacity per room type
- Real-time availability checking

### Reservations
- Search rooms by date range and guest count
- Prevent overbooking with concurrent request handling
- View, modify, and cancel reservations
- Reservation history tracking
- Admin dashboard to manage all reservations

### Payments
- Stripe integration for secure payment processing
- Support for multiple payment methods
- Transaction history and refund processing

### User Interface
- Responsive design for desktop, tablet, and mobile
- Gaming-inspired UI with vibrant colors and interactive elements
- Material-UI components with custom theming
- Advanced filtering and search functionality
- Smooth animations and visual feedback

## Project Structure

```
HotelReservationSystem/
├── backend/
│   └── hotelreservationsystem/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/skillstorm/hotelreservationsystem/
│       │   │   │   ├── config/              # Spring configuration
│       │   │   │   ├── controllers/         # REST API endpoints
│       │   │   │   ├── dto/                 # Data transfer objects
│       │   │   │   ├── models/              # Entity classes
│       │   │   │   ├── repositories/        # Database access
│       │   │   │   └── services/            # Business logic
│       │   │   └── resources/
│       │   │       ├── application.yml
│       │   │       ├── application-local.yml
│       │   │       └── application-prod.yml
│       │   └── test/
│       ├── pom.xml
│       └── mvnw
├── frontend/
│   ├── src/
│   │   ├── components/                      # Reusable components
│   │   ├── pages/                           # Page-level components
│   │   ├── services/                        # API integration (RTK Query)
│   │   ├── store/                           # Redux slices and store
│   │   └── types/                           # TypeScript definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.5.9
- Spring Security 
- Spring Data MongoDB
- Maven

### Frontend
- React 19
- TypeScript 5.9
- Redux Toolkit with RTK Query
- Material-UI (MUI)
- React Router 7
- Vite
- Stripe.js

### Database & Cloud
- MongoDB Atlas (local development)
- AWS DocumentDB (production database)
- AWS for deployment (Elastic Beanstalk, S3, CloudFront)

## Prerequisites

### Backend
- Java Development Kit (JDK) 17+
- Maven 3.8.1+

### Frontend
- Node.js 18.x+
- npm 9.x+

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/[USERNAME]/HotelReservationSystem.git
cd HotelReservationSystem
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend/hotelreservationsystem
```

Install dependencies:
```bash
./mvnw clean install
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../../../frontend
```

Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend/hotelreservationsystem
./mvnw spring-boot:run
```
Backend will run on `http://localhost:8080`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend/hotelreservationsystem
./mvnw clean package -DskipTests
java -jar target/hotelreservationsystem-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

### Authentication
- OAuth2 login via Google - Guest users authenticate at `/oauth2/authorization/google`
- `GET /user` - Get current authenticated user profile
- `GET /employees/me` - Get current authenticated employee profile
- `POST /employees/admin` - Create new employee (admin only)

### Employee Operations
- `GET /employees/reservations` - Get all reservations 
- `PUT /employees/reservations/{id}` - Update reservation status 
- `GET /employees/admin/rooms` - Get all rooms 
- `POST /employees/admin/rooms` - Create room 
- `PUT /employees/admin/rooms/{id}` - Update room 
- `DELETE /employees/admin/rooms/{id}` - Delete room 
- `GET /employees/admin/room-types` - Get all room types 
- `POST /employees/admin/room-types` - Create room type 
- `PUT /employees/admin/room-types/{id}` - Update room type 
- `DELETE /employees/admin/room-types/{id}` - Delete room type 

### Rooms
- `GET /rooms` - Get available rooms (with filters: checkInDate, checkOutDate, guests)
- `GET /rooms/{id}` - Get room details

### Reservations
- `GET /reservations/my-reservations` - Get user's reservations
- `POST /reservations` - Create reservation
- `GET /reservations/{id}` - Get reservation details
- `PUT /reservations/{id}` - Modify reservation
- `DELETE /reservations/{id}` - Cancel reservation

### Payments
- `POST /payments/create-intent` - Create Stripe payment intent

## Deployment

The application is deployed and live on AWS:

- **Frontend**: https://d28qsoaj3pey5k.cloudfront.net/
- **Backend API**: http://leveluplounge.us-east-1.elasticbeanstalk.com/api/

Deployment architecture:
- DocumentDB for database
- Elastic Beanstalk for backend application
- S3 for static frontend files
- CloudFront for CDN and frontend distribution

## Development Team

- **Anthony Huggins** - Full-stack development
- **Samvabi Lamichhane** - Full-stack development