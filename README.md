# Ostia — Artisan Perfume OS (v2.1.0) 🧴✨

A mobile-first, zero-overhead management software designed specifically for solo, handmade perfume artisans selling small batches (10–20 bottles a month).

> **Version**: `v2.1.0`  
> **Workspace Location**: `d:\AG\Perfume\` (Self-contained, strictly isolated project)

---

## 🌟 Complete Capabilities in Ostia v2.1.0

1. **Multi-Stage Production Pipeline & Stock Telemetry (`BatchAgingTracker.tsx`)**
   - **4 Live Inventory Counters**: Total Made (All-Time), In Production (WIP), Ready Stock (On-Shelf), and Delivered/Sold.
   - **7 Sequential Production Milestones**:
     1. Compounding & Concentrate Blending
     2. Alcohol Dilution & Chill Settling
     3. Cold Maceration Aging
     4. Fine Paper Filtration
     5. Flacon Bottling & Pump Crimping
     6. Labeling, Packaging & QC
     7. Finished Stock Ready on Shelf
   - **Customizable Stages**: Rename milestones and adjust typical days.
   - **1-Click Shareable Reminders**: Formatted production alerts with due dates via phone share drawer or clipboard.

2. **Printable Bottle Collar Tags & Certificate of Authenticity (`BottleTagGenerator.tsx`)**
   - High-resolution luxury folding tag with flacon neck loop cutout guide (`✂`), brand monogram, concentration badge (*Extrait de Parfum 24%*), batch maturation details (*35 Days Cold Matured*), Top/Heart/Base scent pyramid, and perfumer certification.
   - Print styling (`window.print()`) formatted for physical bottle neck tags.

3. **Custom Discovery Sample Set Builder (`CustomerStorefront.tsx` & `PricingLab.tsx`)**
   - Clients can choose **50ml Bespoke Flacons** or build a **Custom Discovery Sampler Box (3 × 5ml for ₹899)** with an interactive 3-slot picker.
   - Dedicated Discovery Set economics studio (₹899 price, ₹140 packaging, 71% gross margin).
   - Automated stock deduction of 5ml glass vials and slide boxes upon order placement.

4. **Dynamic Perfume Formulation & Recipe Lab (`RecipeManager.tsx`)**
   - Add new perfumes with multi-ingredient rows, note classifications (Top, Heart, Base, Carrier), and automatic concentration % calculation.
   - 1-tap Batch Volume Scaler (50ml trial blend to 1000ml commercial batch).

5. **Native Indian Rupee (INR ₹) Architecture**
   - All unit costs (₹/g, ₹/ml, ₹/pc), bottle presentation packaging, direct retail prices, margin percentages, order totals, and UPI VPA (`ostia@okaxis`) are natively standardized in INR (₹).

6. **Direct Manual Pricing Override & Margin Engine (`PricingLab.tsx`)**
   - Manual retail price input with presets in ₹ (Friends & Family ₹1,999, Standard Retail ₹2,899, Collector Edition ₹3,499).
   - Real-time gross margin % and net profit per bottle against liquid and packaging COGS.

7. **Self-Contained Public Storefront & UPI QR (`CustomerStorefront.tsx`)**
   - Luxury client-facing fragrance menu (`?mode=store`) with Top/Heart/Base scent pyramids.
   - Instant on-screen UPI QR Code with exact payable amount in ₹, VPA copy button, and self-verification with zero WhatsApp dependency.

8. **Interactive Capabilities & Roadmap Tracker (`RoadmapTracker.tsx`)**
   - In-app interactive checklist tracking completed, active, and upcoming capabilities.

---

## 🚀 Running Ostia v2.1.0

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
- Phone Network URL: `http://192.168.29.237:3000/`
- Direct Customer View: [http://localhost:3000/?mode=store](http://localhost:3000/?mode=store)

---

## 🌐 100% Free Cloud Hosting Deployment

Deploy directly to **Vercel** or **Cloudflare Pages**:
1. Push this folder to a dedicated GitHub repository (`ostia`).
2. Connect to [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com).
3. Build command: `npm run build` | Output directory: `dist`.
4. Your friend gets a free custom URL (e.g. `https://ostia.vercel.app`) that he can add to his phone's home screen as a standalone app!
