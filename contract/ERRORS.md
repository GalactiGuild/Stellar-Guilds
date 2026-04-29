# Contract Error Codes

This document maps the `u32` error codes returned by the Soroban contracts to their respective meanings for frontend developers.

| Error Code (u32) | Name | Description | Recommended Tooltip |
|------------------|------|-------------|----------------------|
| 1 | `Unauthorized` | The caller does not have the necessary permissions for this action. | "You lack the required credentials to perform this action." |
| 2 | `InsufficientFunds` | The account or contract does not have enough balance to complete the transaction. | "Insufficient funds to complete the transaction." |
| 3 | `BountyNotFound` | The requested bounty ID does not exist in the contract storage. | "The specified bounty could not be found." |
| 4 | `AlreadyInitialized` | The contract has already been initialized. | "Contract is already initialized." |
| 5 | `TreasuryNotFound` | The requested treasury ID does not exist. | "The specified treasury could not be found." |
| 6 | `TransactionNotFound` | The requested transaction ID does not exist. | "The specified transaction could not be found." |
| 7 | `BudgetExceeded` | The transaction amount exceeds the allocated budget. | "Budget exceeded for this category." |
| 8 | `AllowanceExceeded` | The transaction amount exceeds the allocated allowance. | "Allowance exceeded for this administrator." |

## Usage for Frontend Developers

When a transaction fails with an error code, you can use this mapping to display user-friendly tooltips. In the Stellar SDK or Soroban SDK, these are typically returned as part of the `Result` or visible in transaction dry-runs.
