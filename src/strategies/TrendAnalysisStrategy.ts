import { Transaction } from '../models.js';
import { HistoricalDataService } from '../services/HistoricalDataService.js';
import { AuditStrategy } from './AuditStrategy.js';

type CategoryComparison = {
  category: string;
  current: number;
  historical: number;
  variance: number | null;
};

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
       .reduce<Record<string, number>>((totals, transaction) => {
        totals[transaction.category] =
          (totals[transaction.category] ?? 0) +
          Math.abs(transaction.amount);
        return totals;
      }, {});
    // 3. For each category, compare current total spending against the historical average.
   
    // 4. Calculate the rate of change / variance percentage: ((current - historical) / historical) * 100.
    // 5. Highlight any category with a variance exceeding +/- 20%.
    // 6. Format and return a text-based audit report detailing comparison metrics.
const categories = [
      ...new Set([
        ...Object.keys(historicalAverages),
        ...Object.keys(currentSpending),
      ]),
    ].sort((a, b) => a.localeCompare(b));

    const comparisons: CategoryComparison[] = categories.map((category) => {
      const current = currentSpending[category] ?? 0;
      const historical = historicalAverages[category] ?? 0;

      return {
        category,
        current,
        historical,variance:
          historical === 0
            ? null
            : ((current - historical) / historical) * 100,
      };
    });
    const growthCategories = comparisons.filter(
      ({ variance }) => variance !== null && variance > 20,
    );
    const savingsCategories = comparisons.filter(
      ({ variance }) => variance !== null && variance < -20,
    );

    const formatComparison = ({
      category,
      current,
      historical,
      variance,
    }: CategoryComparison): string =>
      `${category} | Current: $${current.toFixed(2)} | Historical: $${historical.toFixed(2)} | Change: ${
        variance === null ? 'N/A (historical average is $0.00)' : `${variance.toFixed(2)}%`
      }`;

    const formatSection = (
      heading: string,
      items: CategoryComparison[],
    ): string =>
      `${heading}\n${
        items.length > 0 ? items.map(formatComparison).join('\n') : 'None'
      }`;

    const comparisonTable =
      comparisons.length > 0
        ? comparisons.map(formatComparison).join('\n')
        : 'No spending or historical data available.';

    return [
      'Historical Trend Audit',
      '',
      'Current Spending vs. Historical Average',
      comparisonTable,
      '',
      formatSection('Significant Growth Categories', growthCategories),
      '',
      formatSection('Significant Savings Categories', savingsCategories),
    ].join('\n');
  }
}
