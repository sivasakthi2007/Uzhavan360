# Uzhavan360

Uzhavan360 is a Tamil-first, farmer-centric agriculture platform connecting market information, buyer requirements, expected profit, pre-booking, orders and payment-related workflows in one integrated farmer journey.

## Problem

Farmers face critical challenges in decision-making due to fragmented data and market opacity:

- **Market Price Uncertainty**: Inability to get transparent, real-time mandi prices across local and regional agricultural markets.
- **Buyer Demand Mismatch**: Lack of direct visibility into buyer specifications, required quantities, and target price expectations before harvesting.
- **Hidden Transport & Logistics Costs**: Difficulty estimating transport, loading, and handling expenses prior to selling crops.
- **Net Profit Invisibility**: Farmers sell produce without prior calculation of net profit margins after transportation, labor, and commission deductions.
- **Missing Pre-harvest Opportunities**: Inability to secure contracts and price guarantees before harvest, leaving farmers vulnerable to post-harvest price crashes.
- **Opaque Order & Payment Status**: Unclear tracking of order fulfillment, escrow holds, and payment release timelines.
- **Low-Internet Accessibility**: Traditional agricultural web tools fail in rural areas with weak, intermittent 2G/3G connectivity.

## Solution

Uzhavan360 solves these problems by structuring the end-to-end selling process into a seamless 8-step decision journey:

**Crop → Market Price → Buyer Requirement → Expected Cost → Expected Net Profit → Pre-booking → Order → Payment**

Farmers can check live market benchmarks, match their harvest with buyer purchase orders, compute projected net profits, lock pre-harvest advance contracts, and monitor payments securely—all with full offline capability.

## Key Features

- 🌾 **Crop Intelligence & Mandi Prices**: Real-time mandi prices for key commodities (Tomato, Onion, Paddy, Banana, Coconut, Cotton, etc.) across Tamil Nadu markets with price trends and modal price benchmarks.
- 🤝 **Buyer Requirement Matching**: Direct B2B and B2C marketplace connecting farmers with buyers, bulk procurement offers, and price match notifications.
- 📜 **Pre-Booking & Escrow Contract System**: Pre-harvest contract booking allowing farmers to lock sale prices in advance and secure advance payments before harvest.
- 🚛 **Shared Transport & Equipment Rental**: Direct booking for tractor rentals, harvester equipment, and shared logistics to lower transport costs.
- 👥 **Labor Exchange & Cold Storage Directory**: Local farm labor matching and nearest cold storage warehouse directory to prevent post-harvest loss.
- 🤖 **AI Crop Disease Diagnosis & Sakthi Voice/Text Assistant**: AI-powered leaf disease identification via image upload and multilingual voice/text guidance for farming queries.
- 🌐 **Tamil-First & Multi-Language Support**: Complete localization in Tamil (தமிழ்) and English (EN) tailored for Indian agricultural communities.
- ⚡ **Offline-First Sync Engine**: Local caching and PWA architecture ensuring all features and cached data work seamlessly without active internet connection.

## Innovation

Uzhavan360 connects market information, buyer demand, cost transparency, and expected net profit into a connected selling decision workflow. Instead of treating market prices, buyers, and logistics as disconnected tools, Uzhavan360 guides the farmer step-by-step from crop planning to guaranteed payment settlement.

## Technology Stack

- **Frontend Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons
- **Database & Backend API**: Supabase (`@supabase/supabase-js`), Next.js Serverless API Routes
- **Offline & Mobile Engine**: Service Worker & LocalStorage Sync Engine, Flutter Backend Architecture (`flutter_backend/`)
- **Deployment Platform**: Vercel

## Architecture

```
[ Frontend (Next.js 16 App Router / React 19) ]
                       │
                       ▼
[ Uzhavan360 Backend / Serverless API Routes ]
       ├── /api/market-prices  (Mandi Data Feed)
       ├── /api/weather        (Weather Intelligence)
       ├── /api/diagnose       (AI Crop Disease Model)
       └── /api/translate      (Tamil Translation Engine)
                       │
                       ▼
[ Database & External Services ]
       ├── Supabase PostgreSQL & Auth
       ├── Government Mandi & Scheme Feeds
       └── Local Storage & Offline Sync Queue
```

## Local Development

Prerequisites: Node.js 18+ and npm installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sivasakthi2007/Uzhavan360.git
   cd Uzhavan360
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) (redirects to `/dashboard`).

5. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Variables

The project operates in sandbox mode with fallback mock data when environment variables are omitted. For full live Supabase connectivity, configure the following environment variable names in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Public URL of your Supabase project instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous API key for Supabase client

*Note: Never commit actual API keys or secrets to public repositories.*

## Deployment

The application is live on Vercel:
- **Production App**: [https://uzhavan360.vercel.app](https://uzhavan360.vercel.app)

## Hackathon

Developed and submitted for the **NexBuildOn Hackathon**. Uzhavan360 demonstrates an integrated Tamil-first agricultural platform built to empower Indian farming communities.
