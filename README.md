# Creator Subscription Platform (SaaS)

A production-ready creator subscription platform similar to OnlyFans, built with a modern scalable architecture.

## 🚀 Features
- **Three Core Panels**: 
  - **Fan (Viewer)**: Feed, Discovery, Subscriptions, Paid Content.
  - **Creator**: Dashboard, Analytics, Media Management, Payouts.
  - **Admin**: User management, Moderation, Platform Analytics.
- **Secure Payments**: Stripe integration for subscriptions, tips, and pay-per-view.
- **Real-time Messaging**: Socket.io for chat and notifications.
- **Media Protection**: Blurred previews, signed URLs, and watermarking (FFmpeg).
- **Security**: JWT Auth, Role-based access, Rate limiting.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, TypeScript, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL.
- **Cache**: Redis.
- **Storage**: Cloudflare R2 / AWS S3.
- **Real-time**: Socket.io.

## 📂 Project Structure
```text
/antigravity
├── backend/
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── controllers/    # API Logic
│   │   ├── routes/         # API Endpoints
│   │   ├── middlewares/    # Auth & Validation
│   │   ├── lib/            # Prisma & External clients
│   │   └── server.ts       # Entry point
│   └── .env                # Backend configuration
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js Pages & Layouts
│   │   ├── components/     # UI Components (Sidebar, PostCard)
│   │   └── lib/            # Axios API Client
│   └── .env.local          # Frontend configuration
└── shared/                 # Shared TypeScript types
```

## ⚙️ Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
STRIPE_SECRET_KEY="..."
FRONTEND_URL="http://localhost:3000"
CLOUDFLARE_R2_ACCESS_KEY="..."
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
```

## 🛠 Installation & Setup

1. **Clone the repository**
2. **Setup Services**: Use Docker to start PostgreSQL and Redis.
   ```bash
   docker-compose up -d
   ```
3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run dev
   ```
4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🚢 Deployment
- **Frontend**: Deploy to Vercel.
- **Backend**: Deploy as a Docker container to AWS ECS, Cloud Run, or Railway.
- **Database**: Use a managed RDS or Supabase.
- **Storage**: Cloudflare R2 for cost-effective media hosting.

## 🔒 Security Measures
- All media is served via short-lived signed URLs.
- Paid content is blurred on the client and restricted by middleware on the server.
- Rate limiting implemented on all sensitive endpoints (Auth, Payments).


<!-- Hii I have just test the admin and creator panel so now their is a big issue when last update is their is only user register data will store in db, but creator post and other information post pricing and all menu will not create db record and also admin has not data fetching from db i want every funcinality work  using db every data gets and store and update in database like register record . -->