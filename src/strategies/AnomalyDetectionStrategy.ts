import { Transaction } from '../models.js';
import { AnomalyRulesService } from '../services/AnomalyRulesService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class AnomalyDetectionStrategy implements AuditStrategy {
  public readonly name = 'Anomaly & Duplicate Auditor';
  public readonly description =
    'Detects transactions exceeding thresholds and duplicate records';

  public async execute(
    transactions: Transaction[],
    _customParam?: string,
  ): Promise<string> {
    const rules = await AnomalyRulesService.getRules();

    const outliers = transactions.filter(
      (transaction) =>
        transaction.amount < 0 &&
        Math.abs(transaction.amount) > rules.maxTransactionAmount,
    );

    //group transations using the fields that define a duplicate
    const transactionGroups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
      const duplicateKey = JSON.stringify([
        transaction.date,
        transaction.category,
        transaction.description,
        transaction.amount,
      ]);

      const group = transactionGroups.get(duplicateKey) ?? [];

      group.push(transaction);
      transactionGroups.set(duplicateKey, group);
    }

    //keeps only groups that contain at least two matching transations
    const duplicateGroups = Array.from(transactionGroups.values()).filter(
      (group) => group.length >= 2,
    );

    // Find transactions whose status appears in the flagged status rules.
    const statusFlaggedTransactions = transactions.filter((transaction) =>
      rules.flaggedStatuses.includes(transaction.status),
    );

    // Combine every anomaly type while counting each transaction only once.
    const anomalousTransactions = new Set<Transaction>([
      ...outliers,
      ...duplicateGroups.flat(),
      ...statusFlaggedTransactions,
    ]);

    // Calculate the percentage of all transactions that are anomalous.
    const anomalyRate =
      transactions.length === 0
        ? 0
        : (anomalousTransactions.size / transactions.length) * 100;

    // Add the absolute amounts of all unique anomalous transactions.
    const totalFlaggedValue = Array.from(anomalousTransactions).reduce(
      (total, transaction) => total + Math.abs(transaction.amount),
      0,
    );

    //begin building the text-based audit report
    let report = 'ANOMALY & DUPLICATE AUDIT REPORT\n\n';
    report += 'OUTLIER TRANSACTIONS\n';

    //check whether the outliers array is empty
    if (outliers.length === 0) {
      report += 'No outlier transactions found.\n';
    } else {
      //go through each outlier transation
      for (const transaction of outliers) {
        //add the transations information to report
        report +=
          `Outlier: ${transaction.id} | ${transaction.date} | ` +
          `${transaction.category} | ${transaction.description} | ` +
          `$${Math.abs(transaction.amount).toFixed(2)}\n`;
      }
    }

    // Add the duplicate transaction section.
    report += '\nDUPLICATE TRANSACTIONS\n';

    if (duplicateGroups.length === 0) {
      report += 'No duplicate transactions found.\n';
    } else {
      // Display each duplicate group separately.
      duplicateGroups.forEach((group, index) => {
        report += `Duplicate Group ${index + 1}:\n`;

        // Display every transaction belonging to this duplicate group.
        for (const transaction of group) {
          report +=
            `- ${transaction.id} | ${transaction.date} | ` +
            `${transaction.category} | ${transaction.description} | ` +
            `$${Math.abs(transaction.amount).toFixed(2)}\n`;
        }
      });
    }

    // Add the status-flagged transaction section.
    report += '\nSTATUS-FLAGGED TRANSACTIONS\n';

    if (statusFlaggedTransactions.length === 0) {
      report += 'No status-flagged transactions found.\n';
    } else {
      // Display every transaction that matches a flagged status rule.
      for (const transaction of statusFlaggedTransactions) {
        report +=
          `Flagged Status: ${transaction.id} | ${transaction.date} | ` +
          `${transaction.category} | ${transaction.description} | ` +
          `$${Math.abs(transaction.amount).toFixed(2)} | ` +
          `${transaction.status}\n`;
      }
    }

    // Add the final anomaly statistics.
    report += '\nSUMMARY\n';
    report += `Total Transactions: ${transactions.length}\n`;
    report += `Anomalous Transactions: ${anomalousTransactions.size}\n`;
    report += `Anomaly Rate: ${anomalyRate.toFixed(2)}%\n`;
    report += `Total Flagged Value: $${totalFlaggedValue.toFixed(2)}\n`;

    return report;
  }
}
