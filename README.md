# Rozgaar - Freelance Platform

Rozgaar is a comprehensive freelance platform designed for the Pakistani market, connecting freelancers with clients and providing a seamless experience for gig-based work.

## Features

### For Clients
- Create and manage client accounts
- Browse gigs by category or search for specific skills
- Order gigs from freelancers
- Maintain a balance for ordering gigs
- Review and approve/reject deliveries
- Leave reviews for completed orders
- Request cancellations for orders

### For Freelancers
- Create and manage freelancer accounts
- Create and manage gigs in various categories
- Accept and work on client orders
- Deliver completed work
- Maintain a portfolio of gigs and reviews
- Receive payments upon order completion

### For Admins
- Manage user accounts
- View and delete users
- Monitor platform activity

### Balance System
- Clients need sufficient balance to place orders
- Funds are transferred to freelancers upon order completion
- Balance is refunded to clients if orders are cancelled
- Simple interface to add funds to accounts

## Tech Stack

### Frontend
- Next.js (React framework)
- TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Context API for state management

### Backend
- Node.js with Express
- PostgreSQL database
- Drizzle ORM
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/rozgaar.git
cd rozgaar
```

2. Install dependencies for backend
```bash
cd backend
npm install
```

3. Install dependencies for frontend
```bash
cd ../frontend
npm install
```

4. Setup environment variables
   
   Create a `.env` file in the backend directory with the following:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/rozgaar
   JWT_SECRET=your_jwt_secret
   PORT=3001
   ```

   Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

5. Run database migrations
```bash
cd ../backend
npm run migrate
```

6. Start the backend server
```bash
npm run dev
```

7. Start the frontend application (in a new terminal)
```bash
cd ../frontend
npm run dev
```

8. Access the application at `http://localhost:3000`

## Usage

### Setting up an Admin Account

1. Register a new user through the UI
2. Access your PostgreSQL database
3. Run the following SQL command to update the user role to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

### Managing Orders

1. **For Clients:**
   - Browse and search for gigs
   - Order a gig by providing requirements
   - Review the delivered work and approve/reject
   - Leave a review after completion

2. **For Freelancers:**
   - Create gigs in your preferred categories
   - Accept and work on orders
   - Deliver completed work
   - Maintain good ratings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- All the contributors to this project
- Open-source libraries and frameworks used 