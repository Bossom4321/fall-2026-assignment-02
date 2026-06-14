import * as fs from 'fs/promises';
import * as path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

import { Transaction } from './models.js';
import { TransactionAuditor } from './TransactionAuditor.js';
import { AuditStrategy } from './strategies/AuditStrategy.js';
import { BudgetLimitStrategy } from './strategies/BudgetLimitStrategy.js';
import { AnomalyDetectionStrategy } from './strategies/AnomalyDetectionStrategy.js';
import { TrendAnalysisStrategy } from './strategies/TrendAnalysisStrategy.js';
import { TaxDeductionStrategy } from './strategies/TaxDeductionStrategy.js';
import { MultiCurrencyStrategy } from './strategies/MultiCurrencyStrategy.js';

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    // 1. Load data
    const dataPath = path.resolve(process.cwd(), 'data', 'transactions.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const transactions: Transaction[] = JSON.parse(rawData);

    console.log(`\n==================================================`);
    console.log(`🏦  Personal Finance Transaction Auditor CLI  🏦`);
    console.log(`Loaded ${transactions.length} transactions from database.`);
    console.log(`==================================================\n`);

    // 2. Register strategies
    const strategies: AuditStrategy[] = [
      new BudgetLimitStrategy(),
      new AnomalyDetectionStrategy(),
      new TrendAnalysisStrategy(),
      new TaxDeductionStrategy(),
      new MultiCurrencyStrategy(),
    ];

    // 3. Display Menu
    console.log('Available Audit Strategies:');
    strategies.forEach((strat, index) => {
      console.log(`  [${index + 1}] ${strat.name} - ${strat.description}`);
    });
    console.log(`  [q] Quit`);

    // 4. Prompt for choice
    const choice = await rl.question('\nSelect an option (1-5 or q): ');

    if (choice.trim().toLowerCase() === 'q') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    const strategyIndex = parseInt(choice.trim(), 10) - 1;
    if (
      isNaN(strategyIndex) ||
      strategyIndex < 0 ||
      strategyIndex >= strategies.length
    ) {
      console.error('❌ Invalid option selected. Exiting.');
      rl.close();
      return;
    }

    const selectedStrategy = strategies[strategyIndex];
    console.log(`\n⚙️ Running: ${selectedStrategy.name}...`);

    // 5. Check if strategy requires a custom parameter
    let customParam: string | undefined = undefined;
    if (selectedStrategy instanceof MultiCurrencyStrategy) {
      customParam = await rl.question(
        'Enter target currency (EUR, GBP, JPY, CAD) [default EUR]: ',
      );
      customParam = customParam.trim().toUpperCase() || 'EUR';
    }

    // 6. Execute strategy using Context (TransactionAuditor)
    const auditor = new TransactionAuditor(selectedStrategy);
    const report = await auditor.runAudit(transactions, customParam);

    // 7. Output Report
    console.log(`\n==================================================`);
    console.log(`📋  AUDIT REPORT: ${selectedStrategy.name.toUpperCase()}  📋`);
    console.log(`==================================================`);
    console.log(report);
    console.log(`==================================================\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Error executing CLI:`, message);
  } finally {
    rl.close();
  }
}

main();
