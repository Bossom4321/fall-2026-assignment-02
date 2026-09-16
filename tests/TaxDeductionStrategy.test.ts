import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxDeductionStrategy } from '../src/strategies/TaxDeductionStrategy.js';
import { TaxConfigService } from '../src/services/TaxConfigService.js';
import { Transaction } from '../src/models.js';

describe('TaxDeductionStrategy (Feature 4)', () => {
  let strategy: TaxDeductionStrategy;

  beforeEach(() => {
    strategy = new TaxDeductionStrategy();
    vi.restoreAllMocks();
  });

const mockConfig = {
    standardTaxRate: 0.10,
    deductibleCategories: ['Medical', 'Charity', 'Business'], 
  };

  it('should filter only the categories specified as deductible in the config', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);
    
    const transactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100, category: 'Charity', description: 'Red Cross', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -50, category: 'Food', description: 'Groceries', status: 'completed' }
    ];

    const result = await strategy.execute(transactions);

    expect(result).toContain('Red Cross');
    expect(result).not.toContain('Groceries');
  });

  it('should sum total eligible tax deductions correctly', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

    const transactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -150, category: 'Medical', description: 'Pharmacy', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -50, category: 'Business', description: 'Hosting', status: 'completed' },
      { id: '3', date: '2026-05-03', amount: -20, category: 'Entertainment', description: 'Movies', status: 'completed' }
    ];

    const result = await strategy.execute(transactions);

    expect(result).toContain('200.00');
  });

  it('should calculate estimated tax savings using standardTaxRate', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

    const transactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -300, category: 'Charity', description: 'Donation', status: 'completed' },
    ];

    const result = await strategy.execute(transactions);

    expect(result).toContain('30.00');
  });

  it('should calculate estimated VAT/sales tax paid on non-deductible expense transactions', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

    const transactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100, category: 'Charity', description: 'Donation', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -200, category: 'Food', description: 'Groceries', status: 'completed' },
      { id: '3', date: '2026-05-03', amount: -300, category: 'Personal', description: 'Clothing', status: 'completed' },
    ];

    const result = await strategy.execute(transactions);

    expect(result).toContain('50.00');
  });

  it('should structure report to show both aggregates and itemized deductible transactions', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

    const transactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100, category: 'Business', description: 'Office Supplies', status: 'completed' },
    ];

    const result = await strategy.execute(transactions);

    expect(result).toContain('Office Supplies');
    expect(result).toMatch(/Tax Savings|Estimated.*Savings/i); 
    expect(result).toMatch(/Total|Sum/i);
  });

  it('Scenario 2: should handle an empty transaction list gracefully', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

    const result = await strategy.execute([]);

    expect(result).toMatch(/0\.00/);
    expect(result).toMatch(/None found|0/i);
  });

  it('Scenario 3: should strictly ignore positive amounts (income) even if the category matches', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

    const transactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: 500, category: 'Business', description: 'Client Payment', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -100, category: 'Business', description: 'Software', status: 'completed' }, 
    ];

    const result = await strategy.execute(transactions);

    expect(result).not.toContain('500.00'); 
    expect(result).toContain('100.00'); 
    expect(result).toContain('10.00');  
  });
});