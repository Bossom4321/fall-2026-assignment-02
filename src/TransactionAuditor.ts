import { Transaction } from './models.js';
import { AuditStrategy } from './strategies/AuditStrategy.js';

/**
 * The Context class that maintains a reference to an AuditStrategy
 * and delegates execution to it.
 */
export class TransactionAuditor {
  private strategy: AuditStrategy;

  /**
   * Initializes the auditor with a specific concrete strategy.
   */
  constructor(strategy: AuditStrategy) {
    this.strategy = strategy;
  }

  /**
   * Allows changing the audit strategy dynamically at runtime.
   */
  public setStrategy(strategy: AuditStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Executes the active audit strategy.
   */
  public async runAudit(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    return this.strategy.execute(transactions, customParam);
  }
}
