# Smart Facility App

A full-stack application built with Spring Boot 4.0.4 (Java 21) backend and React 19 frontend for managing smart facility operations.

## Project Structure

```
.
├── backend/               # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/     # Java source files
│   │   │   └── resources/ # Configuration files
│   │   └── test/         # Unit tests
│   ├── pom.xml           # Maven configuration
│   └── mvnw              # Maven wrapper
│
└── frontend/             # React web application
    ├── src/              # React components and pages
    ├── public/           # Static assets
    └── package.json      # npm dependencies
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 21** - [Download](https://www.oracle.com/java/technologies/downloads/#java21)
- **Node.js** (version 16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Maven** (optional - project includes Maven wrapper)

Verify installations:
```bash
java -version
node -v
npm -v
```

## Project Setup

### 1. Backend Setup (Spring Boot)

#### Option A: Using Maven Wrapper (Recommended)

```bash
# Navigate to backend directory
cd backend

# Build the project
mvnw clean install

# Run the application
mvnw spring-boot:run
```

#### Option B: Using Maven

```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend server will start on `http://localhost:8081`

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will automatically open at `http://localhost:3000`

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production Build

**Backend:**
```bash
cd backend
mvnw clean package
```

**Frontend:**
```bash
cd frontend
npm run build
```

## Available Scripts

### Backend
- `mvnw clean install` - Build and install the project
- `mvnw spring-boot:run` - Run the Spring Boot application
- `mvnw test` - Run unit tests

### Frontend
- `npm start` - Start development server (port 3000)
- `npm test` - Run tests
- `npm run build` - Create optimized production build

## Configuration

### Backend Configuration
Configuration settings are in `backend/src/main/resources/application.properties`

### Frontend Configuration
The React app is configured in `frontend/src/App.js`

## Technologies Used

### Backend
- **Spring Boot 4.0.4** - Java web framework
- **Java 21** - Programming language
- **Maven** - Build tool

### Frontend
- **React 19.2.4** - UI library
- **React DOM 19.2.4** - React rendering
- **React Scripts 5.0.1** - CRA build tools

## Testing

### Backend Tests
```bash
cd backend
mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Troubleshooting

### Port Already in Use
If port 8081 (backend) or 3000 (frontend) is already in use:

**Backend:**
Modify `application.properties`:
```properties
server.port=8082
```

**Frontend:**
```bash
PORT=3001 npm start
```

### Build Issues
1. Clear caches:
   ```bash
   cd backend && mvnw clean
   cd frontend && rm -rf node_modules package-lock.json && npm install
   ```

2. Ensure Java 21 is set as your default JDK

3. For npm issues, try:
   ```bash
   npm cache clean --force
   npm install
   ```

## Project Information

- **Group ID:** com.smartfacility
- **Artifact ID:** app
- **Version:** 0.0.1-SNAPSHOT
- **Java Version:** 21
- **Build Tool:** Maven

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of IT3030 PAF Assignment 2026.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
