import { Transaction } from '../models.js';
import { SampleService } from '../services/SampleService.js';
import { AuditStrategy } from './AuditStrategy.js';

/**
 * SAMPLE STRATEGY (Reference Implementation for Students)
 *
 * This strategy demonstrates how to implement an AuditStrategy that:
 * 1. Asynchronously fetches configuration data from a service (SampleService).
 * 2. Processes a list of transactions.
 * 3. Returns a formatted audit report string.
 */
export class SampleStrategy implements AuditStrategy {
  public readonly name = 'Sample Strategy (Reference)';
  public readonly description =
    'Demonstrates async service invocation and strategy structure for testing reference';

  public async execute(
    transactions: Transaction[],
    _customParam?: string,
  ): Promise<string> {
    // 1. Asynchronously fetch configuration from service
    const config = await SampleService.getConfig();

    // 2. Perform calculations
    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const estimatedFee = totalExpenses * config.serviceFeeRate;

    // 3. Format and return audit report
    return (
      `SAMPLE AUDIT REPORT\n` +
      `Total Expenses: $${totalExpenses.toFixed(2)}\n` +
      `Fee Rate: ${(config.serviceFeeRate * 100).toFixed(1)}%\n` +
      `Estimated Service Fee: $${estimatedFee.toFixed(2)}`
    );
  }
}
