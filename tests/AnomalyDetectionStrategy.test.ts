import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnomalyDetectionStrategy } from '../src/strategies/AnomalyDetectionStrategy.js';
import { AnomalyRulesService } from '../src/services/AnomalyRulesService.js';
import { Transaction } from '../src/models.js';

describe('AnomalyDetectionStrategy (Feature 2)', () => {
  let strategy: AnomalyDetectionStrategy;

  beforeEach(() => {
    strategy = new AnomalyDetectionStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should detect outlier transactions exceeding threshold', async () => {
  //   const mockRules = { maxTransactionAmount: 500.00, flaggedStatuses: ['flagged'] };
  //   const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -600.00, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
  //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Laptop');
  //   expect(result).toContain('Outlier');
  // });

  it('should detect outlier transactions exceeding the configured max amount limit', async () => {
    // Mock the rules service with a $500 maximum transaction amount.
    const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      maxTransactionAmount: 500,
      flaggedStatuses: ['flagged'],
    });

    // Provide one outlier expense and one normal expense.
    const testTransactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-05-01',
        amount: -600,
        category: 'Shopping',
        description: 'Laptop',
        status: 'completed',
      },
      {
        id: 'tx-2',
        date: '2026-05-02',
        amount: -100,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    // Verify the service call and the outlier report.
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toContain('OUTLIER TRANSACTIONS');
    expect(result).toContain('Outlier: tx-1');
    expect(result).toContain('Laptop');
    expect(result).toContain('$600.00');
  });

  it('should identify duplicate transactions sharing identical date, amount, category, and description', async () => {
    // Mock the rules so none of these transactions are outliers.
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      maxTransactionAmount: 1000,
      flaggedStatuses: ['flagged'],
    });

    // The first two transactions match on all four duplicate fields.
    const testTransactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-05-10',
        amount: -75,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: 'tx-2',
        date: '2026-05-10',
        amount: -75,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: 'tx-3',
        date: '2026-05-11',
        amount: -25,
        category: 'Transportation',
        description: 'Gas',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    // Verify that both matching transactions appear in one duplicate group.
    expect(result).toContain('DUPLICATE TRANSACTIONS');
    expect(result).toContain('Duplicate Group 1');
    expect(result).toContain('tx-1');
    expect(result).toContain('tx-2');
    expect(result).toContain('Groceries');
  });

  it('should flag transactions matching standard flagged statuses in the rules', async () => {
    // Configure the service to treat the "flagged" status as anomalous.
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      maxTransactionAmount: 1000,
      flaggedStatuses: ['flagged'],
    });

    const testTransactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-05-15',
        amount: -80,
        category: 'Food',
        description: 'Restaurant',
        status: 'flagged',
      },
      {
        id: 'tx-2',
        date: '2026-05-16',
        amount: -40,
        category: 'Transportation',
        description: 'Gas',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    // Verify that the status-flagged transaction appears in the report.
    expect(result).toContain('STATUS-FLAGGED TRANSACTIONS');
    expect(result).toContain('Flagged Status: tx-1');
    expect(result).toContain('Restaurant');
    expect(result).toContain('flagged');
  });

  it('should calculate correct transaction anomaly rates and total flagged valuation', async () => {
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      maxTransactionAmount: 500,
      flaggedStatuses: ['flagged'],
    });

    const testTransactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-05-20',
        amount: -600,
        category: 'Shopping',
        description: 'Laptop',
        status: 'flagged',
      },
      {
        id: 'tx-2',
        date: '2026-05-21',
        amount: -100,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: 'tx-3',
        date: '2026-05-21',
        amount: -100,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: 'tx-4',
        date: '2026-05-22',
        amount: 200,
        category: 'Income',
        description: 'Refund',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    // tx-1 is both an outlier and status-flagged, but counts only once.
    // tx-2 and tx-3 are duplicates, producing 3 anomalies out of 4.
    expect(result).toContain('Total Transactions: 4');
    expect(result).toContain('Anomalous Transactions: 3');
    expect(result).toContain('Anomaly Rate: 75.00%');
    expect(result).toContain('Total Flagged Value: $800.00');
  });

  it('should output a clean, readable text audit report detailing warnings', async () => {
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      maxTransactionAmount: 1000,
      flaggedStatuses: ['flagged'],
    });

    // Run the strategy with no transactions.
    const result = await strategy.execute([]);

    // Verify that every report section is present and handles empty data.
    expect(result).toContain('ANOMALY & DUPLICATE AUDIT REPORT');
    expect(result).toContain('OUTLIER TRANSACTIONS');
    expect(result).toContain('No outlier transactions found.');
    expect(result).toContain('DUPLICATE TRANSACTIONS');
    expect(result).toContain('No duplicate transactions found.');
    expect(result).toContain('STATUS-FLAGGED TRANSACTIONS');
    expect(result).toContain('No status-flagged transactions found.');
    expect(result).toContain('SUMMARY');
    expect(result).toContain('Total Transactions: 0');
    expect(result).toContain('Anomalous Transactions: 0');
    expect(result).toContain('Anomaly Rate: 0.00%');
    expect(result).toContain('Total Flagged Value: $0.00');
  });
});
