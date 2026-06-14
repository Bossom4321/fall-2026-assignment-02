export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  status: 'completed' | 'pending' | 'flagged';
}

// Student 1 Service Model
export type BudgetLimits = Record<string, number>;

// Student 2 Service Model
export interface AnomalyRules {
  maxTransactionAmount: number;
  flaggedStatuses: ('completed' | 'pending' | 'flagged')[];
}

// Student 3 Service Model
export type HistoricalAverages = Record<string, number>;

// Student 4 Service Model
export interface TaxConfig {
  standardTaxRate: number; // e.g. 0.08 for 8%
  deductibleCategories: string[]; // e.g. ['Charity', 'Business', 'Medical']
}

// Student 5 Service Model
export interface ExchangeRates {
  base: string;
  rates: Record<string, number>; // e.g. { EUR: 0.92, GBP: 0.79, JPY: 155.4 }
}
