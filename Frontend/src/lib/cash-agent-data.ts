export interface CashMetrics {
  total_revenue: number
  monthly_target: number
  active_goals: number
  completed_goals: number
  transactions_today: number
  crypto_balance_usd: number
  patreon_subscribers: number
  n26_balance: number
  pending_transactions: number
  reinvestment_amount: number
}

export interface Transaction {
  id: string
  timestamp: string
  amount: number
  currency: string
  source: "n26" | "patreon" | "paypal" | "stripe" | "crypto"
  status: "completed" | "pending" | "failed"
  description: string
  metadata?: Record<string, any>
}

export interface FinancialGoal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  currency: string
  deadline: string
  status: "active" | "completed" | "failed"
  description: string
  progress: number
}

export interface CryptoWallet {
  network: string
  balance: number
  currency: string
  usd_value: number
  address: string
}

export const cashMetrics: CashMetrics = {
  total_revenue: 2847.5,
  monthly_target: 3000,
  active_goals: 4,
  completed_goals: 12,
  transactions_today: 8,
  crypto_balance_usd: 156.78,
  patreon_subscribers: 23,
  n26_balance: 1247.89,
  pending_transactions: 2,
  reinvestment_amount: 569.5,
}

export const recentTransactions: Transaction[] = [
  {
    id: "tx_001",
    timestamp: "2024-01-26T14:30:00Z",
    amount: 25.0,
    currency: "EUR",
    source: "patreon",
    status: "completed",
    description: "Monthly subscription - Tier 2",
  },
  {
    id: "tx_002",
    timestamp: "2024-01-26T13:45:00Z",
    amount: 150.0,
    currency: "EUR",
    source: "stripe",
    status: "completed",
    description: "Video editing service",
  },
  {
    id: "tx_003",
    timestamp: "2024-01-26T12:20:00Z",
    amount: 0.05,
    currency: "SOL",
    source: "crypto",
    status: "pending",
    description: "Solana donation",
  },
  {
    id: "tx_004",
    timestamp: "2024-01-26T11:15:00Z",
    amount: 75.5,
    currency: "EUR",
    source: "paypal",
    status: "completed",
    description: "Freelance consultation",
  },
  {
    id: "tx_005",
    timestamp: "2024-01-26T10:30:00Z",
    amount: -12.99,
    currency: "EUR",
    source: "n26",
    status: "completed",
    description: "Adobe Creative Cloud subscription",
  },
]

export const financialGoals: FinancialGoal[] = [
  {
    id: "goal_001",
    name: "Monthly Revenue Target",
    target_amount: 3000,
    current_amount: 2847.5,
    currency: "EUR",
    deadline: "2024-01-31T23:59:59Z",
    status: "active",
    description: "Reach €3000 monthly revenue from all sources",
    progress: 94.9,
  },
  {
    id: "goal_002",
    name: "Patreon Subscribers",
    target_amount: 50,
    current_amount: 23,
    currency: "subscribers",
    deadline: "2024-02-29T23:59:59Z",
    status: "active",
    description: "Grow Patreon subscriber base to 50 patrons",
    progress: 46.0,
  },
  {
    id: "goal_003",
    name: "Crypto Portfolio",
    target_amount: 500,
    current_amount: 156.78,
    currency: "USD",
    deadline: "2024-06-30T23:59:59Z",
    status: "active",
    description: "Build crypto portfolio to $500 USD value",
    progress: 31.4,
  },
  {
    id: "goal_004",
    name: "Emergency Fund",
    target_amount: 5000,
    current_amount: 1247.89,
    currency: "EUR",
    deadline: "2024-12-31T23:59:59Z",
    status: "active",
    description: "Build emergency fund for business operations",
    progress: 25.0,
  },
]

export const cryptoWallets: CryptoWallet[] = [
  {
    network: "Solana",
    balance: 2.45,
    currency: "SOL",
    usd_value: 89.23,
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv",
  },
  {
    network: "Ethereum",
    balance: 0.023,
    currency: "ETH",
    usd_value: 52.14,
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590b4c5d",
  },
  {
    network: "Bitcoin",
    balance: 0.00034,
    currency: "BTC",
    usd_value: 15.41,
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
]
