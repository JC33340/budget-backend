# **Budgeter App Backend**

A Node.js backend for managing budgeting transactions and user authentication

## **Features**

- **User authentications** - JWT based authentications

- **Transaction management** - Secure API endpoints for manipulating user records.

- **Security** - CORS protection and input validation

## **Tech stack**

- **Backend:** Node.js, Express, TypeScript

- **Database:** MySQL

- **Code formating:** Prettier

- **Frontend:** Connected to a separate repo [here](https://github.com/JC33340/budget-frontend)

- **Deployment:** Deployed on Railway [here](https://budget-frontend-production.up.railway.app)

## **File structure**

```
/src
  ├── classes/      # Error handling class
  ├── config/       # Configuration and environment handling
  ├── controllers/  # Buisness logic for handling requests
  ├── middlware/    # Authentication and validation middleware
  ├── routes/       # Express API route definitions
  ├── types/        # TypeScript interfaces and types
  ├── utils/        # Utility functions
  ├── app.ts        # Entry point to the server
```

## **Installation and setup**

1. Clone the repo

   ```
   git clone https://github.com/JC33340/budget-backend.git
   cd budget-backend
   ```

2. Install dependencies

   ```
   npm i
   ```

3. Create a .env file and add

   ```
   JWT_SECRET = {randomised_hex}
   SENGRID_API_KEY = {your_sengrid_key}
   DB_HOST = {your_db_host}
   DB_USERNAME = {your_db_username}
   DB_PASSWORD = {your_db_password}
   DB_NAME = {your_db_name}
   ```

4. Start development Server

   ```
   npm run dev
   ```
