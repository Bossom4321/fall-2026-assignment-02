import { AnomalyRules } from '../models.js';

export class AnomalyRulesService {
  /**
   * Simulates fetching anomaly detection thresholds and configurations from a remote system.
   */
  public static async getRules(): Promise<AnomalyRules> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          maxTransactionAmount: 1000.0,
          flaggedStatuses: ['flagged'],
        });
      }, 50);
    });
  }
}
