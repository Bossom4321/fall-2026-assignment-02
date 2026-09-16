import { Transaction } from '../models.js';
import { HistoricalDataService } from '../services/HistoricalDataService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TrendAnalysisStrategy implements AuditStrategy {
  public readonly name = 'Historical Trend Auditor';
  public readonly description =
    'Compares current monthly category spending against historical averages';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 3 - Implement this strategy.
    // 1. Call HistoricalDataService.getHistoricalAverages() asynchronously.
    const historicalAverages = await HistoricalDataService.getHistoricalAverages();
    // 2. Group current expenses (amount < 0) by category and compute category totals.
    const currentSpending = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    // 3. For each category, compare current total spending against the historical average.
    const auditResults: string[] = [];
    for (const [category, current] of Object.entries(currentSpending)) {
      const historical = historicalAverages[category];
      if (historical === undefined) {
        continue;
      }
      const variance = ((current - historical) / historical) * 100;
      if (Math.abs(variance) > 20) {
        auditResults.push(`Category: ${category}, Current: ${current}, Historical: ${historical}, Variance: ${variance.toFixed(2)}%`);
      }
    }
    // 4. Calculate the rate of change / variance percentage: ((current - historical) / historical) * 100.
    // 5. Highlight any category with a variance exceeding +/- 20%.
    // 6. Format and return a text-based audit report detailing comparison metrics.

    return auditResults.join('\n');
  }
}