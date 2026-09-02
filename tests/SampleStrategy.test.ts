import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SampleStrategy } from '../src/strategies/SampleStrategy.js';
import { SampleService } from '../src/services/SampleService.js';
import { Transaction } from '../src/models.js';

describe('SampleStrategy (Reference Example for Students)', () => {
  let strategy: SampleStrategy;

  beforeEach(() => {
    strategy = new SampleStrategy();
    vi.restoreAllMocks();
  });

  it('should fetch config from SampleService using vi.spyOn and calculate service fees', async () => {
    // 1. Mock the async service call using Vitest's vi.spyOn
    const mockConfig = { serviceFeeRate: 0.05 }; // 5% fee rate for testing
    const spy = vi
      .spyOn(SampleService, 'getConfig')
      .mockResolvedValue(mockConfig);

    // 2. Create test transactions data
    const testTransactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-05-01',
        amount: -100.0,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: 'tx-2',
        date: '2026-05-02',
        amount: -200.0,
        category: 'Shopping',
        description: 'Clothes',
        status: 'completed',
      },
    ];

    // 3. Execute the strategy under test
    const result = await strategy.execute(testTransactions);

    // 4. Assert service was called and calculation output is correct
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toContain('Total Expenses: $300.00');
    expect(result).toContain('Fee Rate: 5.0%');
    expect(result).toContain('Estimated Service Fee: $15.00');
  });

  it('should handle zero expenses correctly', async () => {
    // Mock the service return value for an empty transaction list case
    vi.spyOn(SampleService, 'getConfig').mockResolvedValue({
      serviceFeeRate: 0.02,
    });

    const result = await strategy.execute([]);

    expect(result).toContain('Total Expenses: $0.00');
    expect(result).toContain('Estimated Service Fee: $0.00');
  });
});
