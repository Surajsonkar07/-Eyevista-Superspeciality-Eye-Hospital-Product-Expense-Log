export interface ProductExpense {
  id: string;
  productName: string;
  price: number; // Always in Indian Rupees (₹)
  additionalInfo?: string; // Additional information (e.g. vendor, batch, usage, notes)
  timestamp: string; // ISO timestamp e.g. 2026-09-17T08:36:35.000Z
  date: string; // e.g. "17 Sep 2026"
  time: string; // e.g. "08:36 AM"
  category?: string; // e.g. "Medical Supplies", "Pharmacy", "Equipment", "General"
  notes?: string;
}

export interface Sheet {
  id: string;
  name: string;
  products: ProductExpense[];
  createdAt: string;
  budgetLimit?: number; // Target budget in Indian Rupees (₹)
}

export type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'name_asc';
