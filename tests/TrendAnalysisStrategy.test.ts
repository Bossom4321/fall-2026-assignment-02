import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrendAnalysisStrategy } from '../src/strategies/TrendAnalysisStrategy.js';
import { HistoricalDataService } from '../src/services/HistoricalDataService.js';
import { Transaction } from '../src/models.js';

describe('TrendAnalysisStrategy (Feature 3)', () => {
  let strategy: TrendAnalysisStrategy;

  beforeEach(() => {
    strategy = new TrendAnalysisStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should compute correct spending variances against historical averages', async () => {
  //   const mockAverages = { Food: 200, Rent: 1000 };
  //   const spy = vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(mockAverages);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -250.00, category: 'Food', description: 'Grocery', status: 'completed' }, // +25% change
  //     { id: '2', date: '2026-05-02', amount: -1000.00, category: 'Rent', description: 'Apartment', status: 'completed' }, // 0% change
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('+25'); // growth detected
  //   expect(result).toContain('Food');
  // });

  it.todo(
    'should group current expenses by category and compute accurate totals',
  );

  it.todo(
    'should calculate variance percentage from historical averages correctly',
  );

  it.todo(
    'should highlight categories exceeding positive/negative 20% variance threshold',
  );

  it.todo(
    'should handle categories present in current data but missing in historical benchmarks',
  );

  it.todo(
    'should format historical vs current comparisons in a readable report',
  );
});
