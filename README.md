# FrozenMart 🧊

Fresh Frozen Food Delivery Platform — Hyderabad

## Setup చేయడానికి Steps

### 1. `.env` file తయారు చేయండి
`.env.example` file ని copy చేసి `.env` అని rename చేయండి.
అందులో మీ keys paste చేయండి:

```
VITE_SUPABASE_URL=మీ supabase project URL
VITE_SUPABASE_ANON_KEY=మీ supabase anon key
VITE_RAZORPAY_KEY_ID=మీ razorpay key id
VITE_ADMIN_PHONE=మీ phone number (10 digits)
```

### 2. Install & Run
```bash
npm install
npm run dev
```

### 3. Deploy to Vercel
- GitHub లో push చేయండి
- Vercel లో import చేయండి
- Environment variables add చేయండి
- Deploy!

## Pages

| URL | Page |
|-----|------|
| / | Landing page |
| /login | Login (all roles) |
| /supplier-register | Supplier signup |
| /shop | Customer shop |
| /cart | Cart |
| /checkout | Checkout + Payment |
| /track/:id | Order tracking |
| /my-orders | Customer orders |
| /supplier | Supplier dashboard |
| /admin | Admin dashboard |
