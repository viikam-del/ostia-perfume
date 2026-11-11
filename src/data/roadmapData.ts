import { RoadmapFeature } from '../types';

export const initialRoadmap: RoadmapFeature[] = [
  {
    id: 'feat-1',
    title: 'Indian Rupee (INR ₹) Currency Standardization',
    category: 'Currency & Core',
    status: 'completed',
    description: 'All unit costs, raw materials, batch totals, retail prices, presets, and order ledgers converted to native INR (₹).'
  },
  {
    id: 'feat-2',
    title: 'Dynamic Recipe & Perfume Creator Studio',
    category: 'Recipe Engine',
    status: 'completed',
    description: 'Full-featured modal to add brand-new perfumes: dynamic multi-ingredient selection, top/heart/base note classification, automatic concentration % calculation, and packaging matrix.'
  },
  {
    id: 'feat-3',
    title: 'Printable Bottle Collar Tag & Authenticity Certificate',
    category: 'Luxury & Packaging',
    status: 'completed',
    description: 'High-resolution artisan certification card with limited-edition numbering (e.g. Bottle 04 of 10), batch aging metrics, scent pyramid breakdown, and print-ready cutouts.'
  },
  {
    id: 'feat-4',
    title: 'Discovery Scent Sampler Builder (3 × 5ml Vials)',
    category: 'Store & Sales',
    status: 'completed',
    description: 'Boutique sampler box option on customer storefront allowing friends/clients to pick 3 sample vials for ₹899 with automated sample packaging tracking.'
  },
  {
    id: 'feat-5',
    title: 'Tech-Forward Obsidian & Cyber Dashboard UI',
    category: 'UI & Aesthetics',
    status: 'completed',
    description: 'Linear/Vercel-inspired dark theme, live telemetry cards, monospace metric readouts, and responsive mobile-first views.'
  },
  {
    id: 'feat-6',
    title: 'Automated Inventory Deduction on Brew & Bottle',
    category: 'Batch & Inventory',
    status: 'completed',
    description: 'Starting a brew automatically deducts precise oil grams and alcohol milliliters from stock; marking a batch bottled deducts flacons/pumps/boxes and increments available stock.'
  },
  {
    id: 'feat-7',
    title: 'Direct INR Pricing Override with Live Gross Margin Engine',
    category: 'Currency & Core',
    status: 'completed',
    description: 'Perfumer can manually set any flat selling price in ₹; system instantly reports net profit (₹) and gross margin (%) against raw materials and packaging COGS.'
  },
  {
    id: 'feat-8',
    title: 'Batch Maturation Aging Countdown & Serialization',
    category: 'Batch & Inventory',
    status: 'completed',
    description: 'Visual countdown timer for perfume maceration, alert triggers on readiness, and limited-edition numbering (e.g., Bottle 04 of 10).'
  },
  {
    id: 'feat-9',
    title: 'Self-Contained Storefront with Live On-Screen UPI QR',
    category: 'Store & Sales',
    status: 'completed',
    description: 'Boutique customer order link featuring olfactory pyramid breakdowns, bottle reservation, and instant dynamic UPI QR code with zero WhatsApp dependency.'
  },
  {
    id: 'feat-10',
    title: 'One-Tap Recipe Batch Volume Scaler',
    category: 'Recipe Engine',
    status: 'completed',
    description: 'Quickly scale recipe formulas from 50ml trial blend to 250ml, 500ml, or 1000ml batches with automatic proportional re-weighting of every ingredient.'
  },
  {
    id: 'feat-11',
    title: 'IFRA Safety Limit & Sensitizer Warning Monitor',
    category: 'Recipe Engine',
    status: 'in_progress',
    description: 'Flag IFRA Category 4 limits on phototoxic oils (bergamot, oakmoss, clove) based on concentration %.'
  },
  {
    id: 'feat-12',
    title: 'Client Olfactory Preferences & Repeat Order CRM',
    category: 'Store & Sales',
    status: 'planned',
    description: 'Track preferred scent families (woody, amber, floral) and re-order reminders for friends and recurring patrons.'
  }
];
