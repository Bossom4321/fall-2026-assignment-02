import { Transaction } from '../models.js';
import { BudgetService } from '../services/BudgetService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class BudgetLimitStrategy implements AuditStrategy {
  public readonly name = 'Budget Limit Auditor';
  public readonly description =
    'Checks category spending against monthly budget limits';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 1 - Implement this strategy.
    // 1. Call BudgetService.getCategoryBudgets() asynchronously.
    const categoryBudgets = await BudgetService.getCategoryBudgets();
    // 2. Group expenses (amounts < 0) by category and compute total spending for each category.
    const spendingByCategory: Record<string, number> = {};
    for (const transaction of transactions) {
      if (transaction.amount < 0) {
        const category = transaction.category;
        if (!spendingByCategory[category]) {
          spendingByCategory[category] = 0;
        }
        spendingByCategory[category] += Math.abs(transaction.amount);
      }
    }
    // 3. Compare spending against the fetched limits.
    const overages: Record<string, number> = {};
    for (const category in categoryBudgets) {
      const limit = categoryBudgets[category];
      const spent = spendingByCategory[category] || 0;
      // 4. Identify overages (categories where spending exceeds the budget).
      if (spent > limit) {
        overages[category] = spent - limit;
      }
    }
    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages, and lists of transactions causing the overage.
    let report = 'Budget Limit Audit Report:\n\n';
    for (const category in overages) {
      const limit = categoryBudgets[category];
      const spent = spendingByCategory[category];
      const overage = overages[category];
      const percentageOver = (overage / limit) * 100;

      report += `Category: ${category}\n`;
      report += `  Budget Limit: $${limit.toFixed(2)}\n`;
      report += `  Actual Spending: $${spent.toFixed(2)}\n`;
      report += `  Overages: $${overage.toFixed(2)} (${percentageOver.toFixed(2)}%)\n`;
      report += `  Transactions causing overage:\n`;

      const overageTransactions = transactions.filter(
        (transaction) =>
          transaction.category === category && transaction.amount < 0,
      );
      for (const transaction of overageTransactions) {
        report += `    - ID: ${transaction.id}, Date: ${transaction.date}, Amount: $${Math.abs(transaction.amount).toFixed(2)}, Description: ${transaction.description}\n`;
      }
    }
    return report;
  }
}
