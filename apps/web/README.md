# Subscription Reminder Frontend

React + TypeScript + Vite frontend for the Subscription Reminder application.

## Features

✅ **Authentication**
- User registration and login
- JWT-based authentication with auto-refresh
- Protected routes

✅ **Dashboard**
- Overview of all subscriptions
- Total monthly and yearly costs
- Upcoming renewals in the next 30 days
- Quick stats and insights

✅ **Subscription Management**
- Create, edit, and delete subscriptions
- Track renewal dates and costs
- Filter and sort subscriptions
- Mark subscriptions as cancelled
- Track cancellation status (success/forgot/decided to keep)

✅ **Beautiful UI**
- Responsive design with Tailwind CSS
- Intuitive navigation
- Loading states and error handling
- Modal dialogs for confirmations

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router 6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Date Utilities**: date-fns

## Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── Layout.tsx       # Main layout with navigation
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── SubscriptionForm.tsx
│   │   ├── SubscriptionDetail.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   └── subscription.service.ts
│   ├── store/
│   │   ├── authStore.ts     # Zustand auth state
│   │   └── subscriptionStore.ts
│   ├── utils/
│   │   └── format.ts        # Formatting utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- Backend server running on http://localhost:5000

### Installation

```bash
# From project root
cd apps/web

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development server
pnpm dev
```

The app will run at **http://localhost:5173**

### Environment Variables

```env
VITE_API_URL=http://localhost:5000
```

## Development

```bash
# Start dev server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm tsc

# Linting
pnpm lint
```

## Features Guide

### Authentication

1. **Register**: Create a new account at `/register`
   - Email validation
   - Strong password requirements
   - Auto-login after registration

2. **Login**: Sign in at `/login`
   - JWT tokens stored in localStorage
   - Automatic token refresh when expired
   - Redirect to dashboard on success

### Dashboard

The dashboard shows:
- Total number of active subscriptions
- Monthly and yearly cost estimates
- Upcoming renewals in the next 30 days
- Quick access to add new subscriptions

### Subscriptions

**List View** (`/subscriptions`):
- View all subscriptions
- Filter by status (Active, Cancelled, etc.)
- Sort by renewal date, name, cost, or date added
- Color-coded urgency for upcoming renewals

**Add/Edit** (`/subscriptions/new` or `/subscriptions/:id/edit`):
- Subscription name and provider
- Optional category
- Cost and currency
- Billing cycle (daily, weekly, monthly, quarterly, yearly)
- Renewal date
- Custom reminder days

**Detail View** (`/subscriptions/:id`):
- Full subscription details
- Days until renewal
- Quick actions to mark cancellation status
- Edit and delete options

### Cancellation Tracking

Track what happened with each subscription:
- **Successfully Cancelled**: You cancelled before renewal
- **Forgot to Cancel**: You missed the deadline
- **Decided to Keep**: You chose to continue

### Responsive Design

The app works on:
- Desktop (1280px+)
- Tablets (768px-1279px)
- Mobile (320px-767px)

## API Integration

The frontend connects to the backend API:

- **Authentication**: `/api/auth/*`
- **Subscriptions**: `/api/subscriptions/*`
- **Notifications**: `/api/notifications/*`

### Auto Token Refresh

Access tokens expire after 15 minutes. The app automatically:
1. Detects 401 Unauthorized responses
2. Uses refresh token to get new access token
3. Retries the original request
4. Redirects to login if refresh fails

## State Management

### Zustand Stores

**Auth Store** (`authStore.ts`):
- User data
- Login/register/logout methods
- Loading and error states

**Subscription Store** (`subscriptionStore.ts`):
- Subscription list
- Current subscription details
- CRUD operations
- Loading and error states

### Why Zustand?

- Simpler than Redux
- No context providers needed
- TypeScript friendly
- Minimal boilerplate

## UI Components

### Common Components

All reusable components follow a consistent pattern:

```tsx
// Button
<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>

// Input
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  error="Invalid email"
/>

// Card
<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

// Select
<Select
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'cancelled', label: 'Cancelled' },
  ]}
/>

// Alert
<Alert type="success" message="Saved successfully!" />

// Modal
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  <p>Are you sure?</p>
</Modal>
```

## Styling

### Tailwind CSS

Custom classes defined in `index.css`:

```css
.btn          /* Base button */
.btn-primary  /* Primary button */
.btn-secondary /* Secondary button */
.btn-danger   /* Danger button */
.input        /* Form input */
.card         /* Card container */
.label        /* Form label */
```

### Color Scheme

- Primary: Purple/Blue gradient (#667eea)
- Success: Green
- Danger: Red
- Warning: Yellow
- Gray: Neutral tones

## Routing

| Route | Page | Access |
|-------|------|--------|
| `/` | Redirect | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | Protected |
| `/subscriptions` | Subscription List | Protected |
| `/subscriptions/new` | Add Subscription | Protected |
| `/subscriptions/:id` | Subscription Detail | Protected |
| `/subscriptions/:id/edit` | Edit Subscription | Protected |
| `/settings` | Settings | Protected |

## Deployment

### Build for Production

```bash
pnpm build
```

Output: `dist/` folder

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables in Vercel:**
- `VITE_API_URL`: Your production backend URL

### Deploy to Netlify

1. Connect GitHub repository
2. Build command: `pnpm build`
3. Publish directory: `dist`
4. Environment variable: `VITE_API_URL`

## Troubleshooting

### API Connection Issues

**Problem**: Requests fail with CORS error

**Solution**:
- Check backend CORS_ORIGIN is set to frontend URL
- Verify VITE_API_URL in .env
- Ensure backend is running

### Authentication Issues

**Problem**: Auto-logout after page refresh

**Solution**:
- Check localStorage has accessToken
- Verify JWT_SECRET matches backend
- Check token expiration time

### Build Errors

**Problem**: TypeScript errors during build

**Solution**:
```bash
pnpm tsc --noEmit  # Check types
```

### Missing Dependencies

**Problem**: Module not found errors

**Solution**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Performance

- **Code Splitting**: Routes are lazy-loaded
- **Image Optimization**: Use optimized images
- **Bundle Size**: ~150KB gzipped
- **Lighthouse Score**: 95+ on all metrics

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
