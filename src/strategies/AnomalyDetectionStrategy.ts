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

    //begin building the text-based audit report
    let report = 'ANOMALY & DUPLICATE AUDIT REPORT\n\n';
    report += 'OUTLIER TRANSACTIONS\n';

    //check whether the outliers array is empty
    if (outliers.length === 0) {
      report += 'No outlier transation found.\n';
    } else {
      //go through each outlier transation
      for (const transaction of outliers){
        //add the transations information to report
        report +=
          `Outlier: ${transaction.id} | ${transaction.date} | ` +
          `${transaction.category} | ${transaction.description} | ` +
          `$${Math.abs(transaction.amount).toFixed(2)}\n`;
      }
    }

    return report;
  }
}