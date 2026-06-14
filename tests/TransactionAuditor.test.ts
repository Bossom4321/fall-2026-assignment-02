import { describe, it, expect, vi } from 'vitest';
import { TransactionAuditor } from '../src/TransactionAuditor.js';
import { AuditStrategy } from '../src/strategies/AuditStrategy.js';
import { Transaction } from '../src/models.js';

describe('TransactionAuditor (Context Class)', () => {
  it('should successfully execute the configured strategy', async () => {
    // Create a mock strategy using Vitest's mocking functions
    const mockStrategy: AuditStrategy = {
      name: 'Mock Strategy',
      description: 'A dummy strategy for testing the context class',
      execute: vi.fn().mockResolvedValue('Mock audit report output'),
    };

    const auditor = new TransactionAuditor(mockStrategy);
    const mockTransactions: Transaction[] = [
      {
        id: 'tx-test',
        date: '2026-05-01',
        amount: -100.0,
        category: 'Food',
        description: 'Test transaction',
        status: 'completed',
      },
    ];

    const result = await auditor.runAudit(mockTransactions, 'extra-param');

    // Verify the context delegated the call correctly
    expect(mockStrategy.execute).toHaveBeenCalledTimes(1);
    expect(mockStrategy.execute).toHaveBeenCalledWith(
      mockTransactions,
      'extra-param',
    );
    expect(result).toBe('Mock audit report output');
  });

  it('should allow dynamically changing strategies at runtime', async () => {
    const mockStrategy1: AuditStrategy = {
      name: 'Strategy 1',
      description: 'First strategy',
      execute: vi.fn().mockResolvedValue('Report 1'),
    };

    const mockStrategy2: AuditStrategy = {
      name: 'Strategy 2',
      description: 'Second strategy',
      execute: vi.fn().mockResolvedValue('Report 2'),
    };

    const auditor = new TransactionAuditor(mockStrategy1);
    expect(await auditor.runAudit([])).toBe('Report 1');

    // Change strategy dynamically
    auditor.setStrategy(mockStrategy2);
    expect(await auditor.runAudit([])).toBe('Report 2');
  });
});
