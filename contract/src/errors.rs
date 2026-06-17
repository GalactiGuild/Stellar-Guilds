use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ErrorCode {
    Unauthorized = 1,
    InsufficientFunds = 2,
    BountyNotFound = 3,
    AlreadyInitialized = 4,
    TreasuryNotFound = 5,
    TransactionNotFound = 6,
    BudgetExceeded = 7,
    AllowanceExceeded = 8,
}
