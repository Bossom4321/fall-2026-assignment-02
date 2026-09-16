import { afterEach,describe, it, expect, vi, beforeEach } from 'vitest';
import { TrendAnalysisStrategy } from '../src/strategies/TrendAnalysisStrategy.js';
import { HistoricalDataService } from '../src/services/HistoricalDataService.js';
import { Transaction } from '../src/models.js';


const transaction = (category: string, amount: number): Transaction =>
  ({ category, amount }) as Transaction;

describe('TrendAnalysisStrategy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('groups expenses and separates significant growth from savings', async () => {
    const serviceMock = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue({
        Dining: 100,
        Groceries: 200,
        Utilities: 100,
      });

    const transactions = [
      transaction('Dining', -70),
      transaction('Dining', -60),
      transaction('Groceries', -50),
      transaction('Groceries', -100),
      transaction('Utilities', -90),
      transaction('Dining', 500), // Income must not count as spending.
    ];

    const report = await new TrendAnalysisStrategy().execute(transactions);

    expect(serviceMock).toHaveBeenCalledOnce();
    expect(report).toContain(
      'Dining | Current: $130.00 | Historical: $100.00 | Change: 30.00%',
    );
    expect(report).toContain(
      'Groceries | Current: $150.00 | Historical: $200.00 | Change: -25.00%',
    );
    expect(report).toContain(
      'Utilities | Current: $90.00 | Historical: $100.00 | Change: -10.00%',
    );

    const growthSection = report.split('Significant Growth Categories')[1]
      .split('Significant Savings Categories')[0];
    const savingsSection = report.split('Significant Savings Categories')[1];

    expect(growthSection).toContain('Dining');
    expect(growthSection).not.toContain('Utilities');
    expect(savingsSection).toContain('Groceries');
    expect(savingsSection).not.toContain('Utilities');
  });

  it('reports historical categories with no current spending as savings', async () => {
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue({
      Travel: 300,
    });

    const report = await new TrendAnalysisStrategy().execute([]);

    expect(report).toContain(
      'Travel | Current: $0.00 | Historical: $300.00 | Change: -100.00%',
    );
    expect(report.split('Significant Savings Categories')[1]).toContain(
      'Travel',
    );
  });

  it('does not flag categories whose variance is exactly plus or minus 20%', async () => {
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue({
      Fuel: 100,
      Shopping: 100,
    });

    const report = await new TrendAnalysisStrategy().execute([
      transaction('Fuel', -120),
      transaction('Shopping', -80),
    ]);

    expect(report).toContain('Fuel | Current: $120.00');
    expect(report).toContain('Shopping | Current: $80.00');
    expect(report).toContain('Significant Growth Categories\nNone');
    expect(report).toContain('Significant Savings Categories\nNone');
  });

  it('handles zero historical averages without returning Infinity or NaN', async () => {
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue({
      NewCategory: 0,
    });

    const report = await new TrendAnalysisStrategy().execute([
      transaction('NewCategory', -25),
    ]);

    expect(report).toContain('N/A (historical average is $0.00)');
    expect(report).not.toContain('Infinity');
    expect(report).not.toContain('NaN');
  });

  it('handles completely empty current and historical data', async () => {
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(
      {},
    );

    const report = await new TrendAnalysisStrategy().execute([]);

    expect(report).toContain('No spending or historical data available.');
    expect(report).toContain('Significant Growth Categories\nNone');
    expect(report).toContain('Significant Savings Categories\nNone');
  });
});
