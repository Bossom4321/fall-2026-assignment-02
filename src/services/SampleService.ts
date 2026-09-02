export interface SampleConfig {
  serviceFeeRate: number;
}

export class SampleService {
  /**
   * Simulates fetching system configuration asynchronously.
   */
  public static async getConfig(): Promise<SampleConfig> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ serviceFeeRate: 0.02 });
      }, 50);
    });
  }
}
