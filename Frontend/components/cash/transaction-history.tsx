"use client"

import { recentTransactions } from "@/lib/cash-agent-data"
import { Activity, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from "lucide-react"

export function TransactionHistory() {
  const getSourceColor = (source: string) => {
    switch (source) {
      case "patreon":
        return "text-orange-400"
      case "stripe":
        return "text-purple-400"
      case "paypal":
        return "text-blue-400"
      case "n26":
        return "text-green-400"
      case "crypto":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Activity className="h-5 w-5 text-red-600" />
        <h2 className="text-lg font-bold text-white font-mono">RECENT TRANSACTIONS</h2>
      </div>

      <div className="space-y-3">
        {recentTransactions.map((transaction) => {
          const isIncome = transaction.amount > 0
          const datetime = new Date(transaction.timestamp)

          return (
            <div key={transaction.id} className="bg-gray-800 border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isIncome ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-400" />
                  )}

                  <div>
                    <div className="text-sm font-mono text-white font-bold">{transaction.description}</div>
                    <div className="flex items-center space-x-4 text-xs font-mono text-gray-400 mt-1">
                      <span>
                        {datetime.toLocaleDateString()} {datetime.toLocaleTimeString()}
                      </span>
                      <span className={getSourceColor(transaction.source)}>{transaction.source.toUpperCase()}</span>
                      <span>ID: {transaction.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${isIncome ? "text-green-400" : "text-red-400"}`}>
                      {isIncome ? "+" : ""}
                      {transaction.amount} {transaction.currency}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transaction.status)}
                    <span
                      className={`text-xs font-mono ${
                        transaction.status === "completed"
                          ? "text-green-400"
                          : transaction.status === "pending"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {transaction.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
