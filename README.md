# Subscription Reminder App

A web application to help you track and remember to cancel subscriptions before they renew.

## Features

- Track subscription renewal dates
- Email and SMS notifications before renewals
- Browser extension for automatic subscription detection
- Cancellation tracking (mark as cancelled, success/forgot)
- Analytics and spending insights

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Notifications**: Resend (email), Twilio (SMS)
- **Browser Extension**: Chrome/Firefox extension with React

## Project Structure

```
subscription-reminder/
├── apps/
│   ├── web/          # React web application
│   ├── backend/      # Node.js backend API
│   └── extension/    # Browser extension
├── packages/
│   └── shared/       # Shared types and utilities
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env

# Run database migrations
cd apps/backend
pnpm prisma migrate dev

# Start development servers
pnpm dev
```

## Development

- **Web app**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: postgresql://localhost:5432/subscriptions

## License

MIT
