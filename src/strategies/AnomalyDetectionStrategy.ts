import { Transaction } from '../models.js';
import { AnomalyRulesService } from '../services/AnomalyRulesService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class AnomalyDetectionStrategy implements AuditStrategy {
  public readonly name = 'Anomaly & Duplicate Auditor';
  public readonly description =
    'Detects transactions exceeding thresholds and duplicate records';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 2 - Implement this strategy.
    // 1. Call AnomalyRulesService.getRules() asynchronously.
    // 2. Scan transactions to find outliers (expenses exceeding rules.maxTransactionAmount).
    // 3. Scan to identify duplicates (transactions sharing the exact same date, category, description, and amount).
    // 4. Identify transactions having a status that matches any in rules.flaggedStatuses.
    // 5. Calculate total flagged value and anomaly rates.
    // 6. Format and return a text-based audit report of anomalies, duplicate sets, and totals.

    throw new Error('Method not implemented.');
  }
}
