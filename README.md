# Assignment 2: Teamwork Git & Vitest Testing - Personal Finance CLI Auditor

Welcome to Assignment 2! In this assignment, you will work in a team of **up to 5 students** to build a command-line interface (CLI) application named the **Personal Finance Transaction Auditor**.

This assignment will help you master:

1. **The Strategy Design Pattern** in TypeScript.
2. **Asynchronous JavaScript/TypeScript** using `async/await` and Promises.
3. **Unit Testing & Mocking** using the modern **Vitest** library.
4. **Git & GitHub Team Workflows** (branching, pull requests, code reviews, and resolving conflicts).

---

## 🏛️ Project Architecture: Strategy Pattern

The project is structured using the **Strategy Design Pattern**. The Strategy pattern allows an application to choose an algorithm or behavior at runtime.

In this application:

- `src/models.ts` defines the structure of a `Transaction` and other helper configurations.
- `src/strategies/AuditStrategy.ts` defines the interface that all auditing algorithms must implement.
- `src/TransactionAuditor.ts` is the **Context** class. It accepts any class implementing `AuditStrategy` and executes it.
- `src/index.ts` is the **CLI Entry Point**. It reads transactions from a local database file, presents a menu, and invokes the auditor context with the chosen strategy.

```
┌─────────────────────────────────┐
│     src/index.ts (CLI Entry)    │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ src/TransactionAuditor.ts       │
│ (Context Class)                 │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ src/strategies/                 │
│ AuditStrategy.ts (Interface)    │
└──────┬───┬───┬─────────┬───┬────┘
       │   │   │         │   │
       │   │   │         │   └─► Feature 5: MultiCurrencyStrategy.ts
       │   │   │         └─────► Feature 4: TaxDeductionStrategy.ts
       │   │   └───────────────► Feature 3: TrendAnalysisStrategy.ts
       │   └───────────────────► Feature 2: AnomalyDetectionStrategy.ts
       └───────────────────────► Feature 1: BudgetLimitStrategy.ts
```

---

## 👥 Team Assignment & Git Workflow (4 Points)

Your team will share a single GitHub repository. **Crucial Rule: There is exactly one student per feature.**

- Each team member must choose a **different** feature from Features 1 through 5.
- No two students on a team may implement the same feature.
- Each student is graded independently (out of 20 points) based on the specific feature they chose and its corresponding test suite.

### Git Steps:

1.  **Repository Setup**: One team member must create a private repository on GitHub and invite all other teammates as collaborators. Push this starter harness code to the repository's `main` branch.
2.  **Choose Features**: Assign exactly one feature (1-5) to each student.
3.  **Create a Branch**: Before writing any code, create a branch named exactly:
    `feature/feature-<number>-<your-name>` (e.g., `feature/feature-1-sara`).
4.  **Commit Often**: Write clean, modular commits with meaningful messages (e.g., `feat: implement budget overage checks` or `test: mock BudgetService for Feature 1`).
5.  **Submit a Pull Request (PR)**: Push your branch to GitHub and open a Pull Request to merge into `main`.
6.  **Code Review**: **At least one other teammate must review, comment on, and approve your PR before it is merged.** You will lose points if you merge your own PR without review!
7.  **Resolve Conflicts**: If any conflicts arise (e.g., in package files or registry lists), work together to resolve them.

---

## 🛠️ Feature Requirements (10 Points)

Every student must implement the `execute` method for their assigned strategy class. Because this simulates a real-world software system, **each student must asynchronously fetch configuration data from a mock service.**

### Feature 1: Budget Limit Auditor (`src/strategies/BudgetLimitStrategy.ts`)

- **External Service**: Call `BudgetService.getCategoryBudgets()` asynchronously to retrieve a list of category spending limits.
- **Calculation**:
  1. Group all expense transactions (transactions where `amount < 0`) by their category.
  2. Sum the total absolute expenses for each category.
  3. Compare the total spending to the category's budget limit fetched from the service.
  4. Find all categories that exceed their budget, calculating the absolute overage (e.g., spent $150 of $100, overage is $50) and the percentage exceeded (e.g., 150%).
- **Report Output**: Return a text report containing:
  - A summary section listing all categories, their budget limits, and actual spending.
  - A warning list of over-budget categories showing overage amounts and percentages.
  - An itemized list of all transaction details contributing to the overage.

### Feature 2: Anomaly & Duplicate Auditor (`src/strategies/AnomalyDetectionStrategy.ts`)

- **External Service**: Call `AnomalyRulesService.getRules()` asynchronously to retrieve the threshold rules.
- **Calculation**:
  1. Identify all outlier transactions (expenses where the absolute transaction amount exceeds `maxTransactionAmount` rule).
  2. Identify duplicate sets. A duplicate occurs when two or more transactions share the exact same `date`, `category`, `description`, and `amount`.
  3. Filter all transactions whose status matches any of the flagged statuses in the rules (e.g., `'flagged'`).
  4. Calculate the percentage of total transactions that are anomalous.
- **Report Output**: Return a text report containing:
  - A list of all outlier transactions.
  - A grouped list of duplicate transaction pairs/sets.
  - A list of transactions flagged due to matching status rules.
  - Summarized stats showing total anomalous transaction count and percentage.

### Feature 3: Historical Trend Auditor (`src/strategies/TrendAnalysisStrategy.ts`)

- **External Service**: Call `HistoricalDataService.getHistoricalAverages()` asynchronously to retrieve historical spending benchmarks.
- **Calculation**:
  1. Group all current expenses (amount < 0) by category and compute category totals.
  2. Compare the current spending total for each category against its historical monthly average.
  3. Calculate the percentage variance: `((Current - Historical) / Historical) * 100`.
  4. Identify categories showing a variance exceeding +/- 20% (e.g., a +25% increase or -30% decrease).
- **Report Output**: Return a text report containing:
  - A table showing current spending vs. historical average and percentage change for all categories.
  - A section highlighting "Significant Growth Categories" (variance > +20%) and "Significant Savings Categories" (variance < -20%).

### Feature 4: Tax & Deductions Auditor (`src/strategies/TaxDeductionStrategy.ts`)

- **External Service**: Call `TaxConfigService.getTaxConfig()` asynchronously to retrieve standard tax rate and eligible deductible categories.
- **Calculation**:
  1. Filter transactions belonging to eligible deductible categories (e.g., `'Charity'`, `'Business'`, `'Medical'`) where `amount < 0`.
  2. Sum the absolute total of all eligible deductions.
  3. Estimate tax savings based on the tax rate: `Total Deductions * standardTaxRate`.
  4. Estimate standard sales tax (VAT) paid on all **non-deductible** expenses: `Sum(Non-Deductible absolute amounts) * standardTaxRate`.
- **Report Output**: Return a text report containing:
  - An itemized list of all qualifying deductible transactions.
  - Total sum of deductions and estimated tax savings.
  - Estimated sales tax (VAT) paid on regular, non-deductible items.

### Feature 5: Multi-Currency Auditor (`src/strategies/MultiCurrencyStrategy.ts`)

- **External Service**: Call `ExchangeRateService.getExchangeRates()` asynchronously to retrieve rates relative to USD.
- **Calculation**:
  1. Read the target currency from `customParam` (e.g. `'EUR'`, `'GBP'`, `'JPY'`). If not provided or invalid, default to `'EUR'`.
  2. Retrieve the conversion rate for the target currency (throw an error if the currency is unsupported).
  3. Convert all transaction amounts to the target currency.
  4. Calculate overall statistics (total income, total expenses, net balance, and average transaction amount) in both USD and the target currency.
- **Report Output**: Return a text report containing:
  - The conversion rate used.
  - Aggregated metrics (income, expenses, balance, average) displayed side-by-side in both USD and the target currency.
  - A list of all transactions showing their converted amounts in the target currency.

---

## 🧪 Testing with Vitest (6 Points)

Testing is a core requirement of this assignment. You must write Unit Tests for your specific strategy in the corresponding test file in the `tests/` directory.

### Requirements:

1.  **Test Coverage**: Write tests verifying the correctness of your calculations, grouping, filtering, and report contents. Test at least **3 distinct scenarios** (e.g., normal case, empty/no transactions, edge case parameters).
2.  **Mocking Async Services**: Since your strategies invoke asynchronous external services, you **MUST mock the service methods** using Vitest (`vi.spyOn` or `vi.mock`). This ensures your tests run reliably without actual database or API dependencies.
3.  **Instructional Examples**: Look at `tests/TransactionAuditor.test.ts` to see a working example of mocking and unit testing. Additionally, check the comments in your specific test file (e.g., `tests/BudgetLimitStrategy.test.ts`) for mocking templates.

---

## 📊 Grading Rubric (20 Points Per Student)

Each student is graded independently on their implementation file and test file.

| Rubric Category               | Points        | Description                                                                                                                                                                                                                                             |
| :---------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Functional Implementation** | **10 Points** | Correctly implements the strategy. Correctly uses `async/await` for service calls. Groups, sums, filters, and formats outputs accurately according to specifications. Handles edge cases (e.g. empty arrays, missing data) gracefully without crashing. |
| **Unit Testing (Vitest)**     | **6 Points**  | Implements comprehensive unit tests using Vitest. Correctly mocks the async service API using `vi.spyOn` or equivalent. Asserts correct mathematical calculations, output formatting, and error handling.                                               |
| **Git & Teamwork**            | **4 Points**  | Follows branching rules (`feature/feature-...`). Shows multiple commits with descriptive messages. Opens a clean Pull Request on GitHub. Reviews and approves at least one teammate's PR with comments.                                                 |

---

## 🚀 Setup & Execution Instructions

### Installation

Clone this repository on your machine, navigate to the directory, and install the dependencies:

```bash
npm install
```

### Run the CLI Application

Run the application using:

```bash
npm start
```

You will be prompted to select which strategy to run. Note that selecting a strategy before implementing it will throw a `"Method not implemented"` error.

### Run Tests

To run all tests in the project once:

```bash
npm test
```

To run tests in watch/interactive mode:

```bash
npm run test:watch
```

### Code Quality / Linting

Ensure your TypeScript compiles and lints with no errors:

```bash
npm run lint
```

Format code styling rules:

```bash
npm run format
```
