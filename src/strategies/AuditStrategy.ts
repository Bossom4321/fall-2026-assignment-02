import { Transaction } from '../models.js';

export interface AuditStrategy {
  /**
   * The display name of the strategy (used in the CLI menu).
   */
  readonly name: string;

  /**
   * A short description explaining what this audit strategy does.
   */
  readonly description: string;

  /**
   * Executes the analysis on the list of transactions and returns a formatted report string.
   *
   * @param transactions List of transactions to audit.
   * @param customParam Optional parameter for dynamic inputs (e.g., target currency code).
   */
  execute(transactions: Transaction[], customParam?: string): Promise<string>;
}
