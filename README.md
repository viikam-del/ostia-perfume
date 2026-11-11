# Ostia — Artisan Perfume OS (v1.0.0) 🧴✨

A mobile-first, zero-overhead management software designed specifically for solo, handmade perfume artisans selling small batches (10–20 bottles a month).

> **Version**: `v1.0.0`  
> **Workspace Location**: `d:\AG\Perfume\` (Self-contained, strictly isolated project)

---

## 🌟 What Ostia v1.0.0 Covers

1. **Pricing Lab & Direct Price Override**
   - Direct price setting (e.g., $45 standard or $35 friends & family) with live margin and profit readouts.
   - Micro-costing of formula ingredients (essential oils, aroma molecules, perfumer's alcohol) + packaging (glass bottles, fine mist atomizers, stamped labels, rigid linen boxes).

2. **Maceration & Maturation Aging Tracker**
   - Active aging countdown gauge (e.g., *Day 18 of 30*).
   - Alerts when a brew reaches olfactory maturity and is ready for bottling.
   - Limited-edition bottle serialization (e.g., *Bottle 04 of 10 • Batch #04*).

3. **Customer Storefront Link (`?mode=store`)**
   - Public-facing luxury fragrance menu for friends and family.
   - Features olfactory scent pyramids (Top, Heart, Base notes) and bottle reservation.

4. **Self-Contained On-Screen Payment QR (Zero WhatsApp Dependency)**
   - Instant on-screen UPI QR code and payment handle after placing an order.
   - Maker can verify payment in one tap (`✓ UPI Received` or `Cash Paid`).

5. **Hardware & Raw Stock Alerts**
   - Automatic warnings when bottles, atomizers, or oils drop below safe reorder thresholds.

6. **Isolated Local Persistence**
   - All state persists offline in browser storage under `ostia_v1_*` keys without cloud fees or database setup.

---

## 🚀 Running Ostia v1.0.0

### Local Development
```bash
npm install
npm run dev
```

### Production Preview Server
```bash
npm run preview -- --port 3000 --host
```
- Local URL: [http://localhost:3000/](http://localhost:3000/)
- Phone Network URL: `http://192.168.0.115:3000/`
- Direct Customer View: [http://localhost:3000/?mode=store](http://localhost:3000/?mode=store)

---

## 🌐 100% Free Hosting Deployment

Deploy directly to **Vercel** or **Cloudflare Pages**:
1. Push this folder to a dedicated GitHub repository (`ostia`).
2. Connect to [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com).
3. Build command: `npm run build` | Output directory: `dist`.
4. Your friend gets a free custom URL (e.g. `https://ostia.vercel.app`) that he can add to his phone's home screen as a standalone app!
