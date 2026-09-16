import { Transaction } from '../models.js';
import { TaxConfigService } from '../services/TaxConfigService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TaxDeductionStrategy implements AuditStrategy {
  public readonly name = 'Tax & Deductions Auditor';
  public readonly description =
    'Identifies eligible tax-deductible expenses and estimates savings';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    const { standardTaxRate, deductibleCategories } = await TaxConfigService.getTaxConfig();
    const eligibleCategoriesSet = new Set(
      deductibleCategories.map((cat: string) => cat.toLowerCase())
    );

    const deductibleTransactions: Transaction[] = [];
    let totalDeductions = 0;
    let totalNonDeductibleExpenses = 0;

    for (const tx of transactions) {
      if (tx.amount < 0) {
        const absAmount = Math.abs(tx.amount);
        const categoryMatch = eligibleCategoriesSet.has(tx.category?.toLowerCase() ?? '');

        if (categoryMatch) {
          deductibleTransactions.push(tx);
          totalDeductions += absAmount;
        } else {
          totalNonDeductibleExpenses += absAmount;
        }
      }
    }

    const estimatedTaxSavings = totalDeductions * standardTaxRate;
    const estimatedVatPaid = totalNonDeductibleExpenses * standardTaxRate;
    const formattedDeductions = totalDeductions.toFixed(2);
    const formattedSavings = estimatedTaxSavings.toFixed(2);
    const formattedVat = estimatedVatPaid.toFixed(2);
    const taxRatePercent = (standardTaxRate * 100).toFixed(1);

    let report = `Tax & Deductions Audit Report\n`;
    report += `=============================\n`;
    report += `Standard Tax Rate: ${taxRatePercent}%\n\n`;

    report += `Eligible Deductible Transactions:\n`;
    if (deductibleTransactions.length === 0) {
      report += `  - None found\n`;
    } else {
      for (const tx of deductibleTransactions) {
        report += `  - [${tx.date || 'N/A'}] ${tx.description || 'Expense'}: $${Math.abs(tx.amount).toFixed(2)} (${tx.category})\n`;
      }
    }

    report += `\nSummary:\n`;
    report += `Total Deductible Expenses: $${formattedDeductions}\n`;
    report += `Estimated Tax Savings: $${formattedSavings}\n`;
    report += `Estimated VAT Paid (Non-Deductible): $${formattedVat}\n`;

    return report;
  }
}