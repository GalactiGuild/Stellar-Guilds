# Stellar Guilds

A decentralized guild and bounty platform on Stellar, where communities fund projects, distribute rewards, and automate payments through multi-contract workflows.

## Overview

Stellar Guilds is a decentralized platform for community-driven projects and collaborations. It allows individuals or organizations to create guilds, fund projects, and automatically distribute rewards using Stellar smart contracts (Soroban).

## Key Features

### 🏰 Guild Creation & Membership Contracts
- Users can create guilds (like DAOs) with multiple members
- Membership contracts define voting power, roles, and staking rules
- Decentralized governance for community-driven decisions

### 💰 Bounty & Task Contracts
- Guilds can post tasks or challenges with attached payment pools
- Smart contracts hold funds in escrow until completion criteria are met
- Transparent and automated task management

### 💸 Payment Distribution Contracts
- Payments are automatically split among contributors based on rules (percentage shares, milestones, or token staking)
- Supports multiple currencies: XLM or custom Stellar tokens
- Fair and automated reward distribution

### 🎯 Milestone & Subscription Contracts
- Projects with multiple phases release payments automatically upon milestone completion
- Recurring rewards for ongoing contributors
- Long-term project sustainability

### ⚖️ Dispute Resolution Contracts
- Optional arbitration module for conflicts between guilds and contributors
- Funds can be released based on voting outcomes
- Fair conflict resolution mechanisms

### ⭐ Reputation & Incentive Layer
- Contributors earn reputation tokens for successful task completion
- Higher reputation increases future payment rates or access to premium bounties
- Merit-based ecosystem growth

### 👥 Community & Social Engagement
- Enhanced user profiles with activity feeds, achievements, and follow systems
- Real-time community feed, direct messaging with optional end‑to‑end encryption, and notification bell
- Discussion forums with moderation tools for collaborative conversations
- Privacy controls and spam prevention mechanisms baked into settings
- Designed for scalability with minimal latency and cross‑platform synchronization


## Architecture

### Contract Layer
Each component of the platform is powered by Soroban smart contracts:
- **Guild Membership Contracts**: Manage members, roles, and governance
- **Bounty/Escrow Contracts**: Handle task creation and fund locking
- **Milestone Release Contracts**: Automate payment releases based on milestones
- **Payment Distribution Contracts**: Multi-party revenue sharing and staking
- **Dispute Resolution Contracts**: Optional arbitration and conflict management

### Payment System
- Supports one-off payments and recurring payouts
- Native XLM and custom Stellar token support
- Every task, milestone, or bounty involves real Stellar transactions

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Smart Contracts** | Soroban (Rust) |
| **Frontend** | React + TypeScript + Tailwind CSS |
| **Blockchain** | Stellar Network |
| **Data Storage** | IPFS for metadata, Stellar ledger for transactions |
| **Authentication** | Wallet-based (Freighter or XUMM) |

## Project Structure

```
Stellar-Guilds/
├── contract/           # Soroban smart contracts (Rust)
│   ├── guild/         # Guild membership contracts
│   ├── bounty/        # Bounty and task contracts
│   ├── payment/       # Payment distribution contracts
│   ├── milestone/     # Milestone management contracts
│   └── dispute/       # Dispute resolution contracts
├── frontend/          # React frontend application
├── docs/              # Documentation
└── scripts/           # Deployment and utility scripts
```

## Getting Started

### Prerequisites

- **Rust**: Install from [rustup.rs](https://rustup.rs/)
- **Soroban CLI**: Install Stellar Soroban tools
  ```bash
  cargo install --locked soroban-cli
  ```
- **Node.js**: v18+ for frontend development
- **Stellar Wallet**: Freighter or XUMM for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Stellar-Guilds.git
   cd Stellar-Guilds
   ```

2. **Set up smart contracts**
   ```bash
   cd contract
   cargo build --target wasm32-unknown-unknown --release
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Development

#### Smart Contract Development
```bash
cd contract
cargo test
cargo build --target wasm32-unknown-unknown --release
```

#### Frontend Development
```bash
cd frontend
npm run dev
```

## Testing

### Contract Testing
```bash
cd contract
cargo test
```

### Integration Testing
```bash
# Run local Stellar network
soroban network start

# Deploy contracts
./scripts/deploy.sh

# Run tests
cargo test --features integration
```

## Deployment

### Testnet Deployment
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contract.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet
```

### Mainnet Deployment
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contract.wasm \
  --source YOUR_SECRET_KEY \
  --network mainnet
```

## Use Cases

- **Open Source Communities**: Fund contributors for bug fixes and feature development
- **Creative Guilds**: Coordinate artists, writers, and creators with automated payments
- **Research DAOs**: Pool funds for research projects with milestone-based payouts
- **Freelance Collectives**: Manage multi-party projects with transparent payment splits
- **Gaming Guilds**: Distribute rewards and manage in-game economies

## Roadmap

- [ ] Phase 1: Core guild and membership contracts
- [ ] Phase 2: Bounty and escrow system
- [ ] Phase 3: Payment distribution logic
- [ ] Phase 4: Milestone tracking and automation
- [ ] Phase 5: Dispute resolution mechanism
- [ ] Phase 6: Reputation and incentive layer
- [ ] Phase 7: Frontend dashboard and wallet integration
- [ ] Phase 8: Mainnet launch

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## Acknowledgments

- Built on [Stellar](https://stellar.org/) blockchain
- Powered by [Soroban](https://soroban.stellar.org/) smart contracts
- Inspired by the open-source and DAO communities

---

**Made with ❤️ for decentralized collaboration**

// Contributed via automated bounty system
