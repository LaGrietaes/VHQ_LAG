"use client"

import { cashMetrics, financialGoals } from "@/lib/cash-agent-data"
import { DollarSign, TrendingUp, Target, Users, Wallet, PiggyBank } from "lucide-react"

export function FinancialOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-xs font-mono text-gray-400">TOTAL REVENUE</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">€{cashMetrics.total_revenue.toFixed(2)}</div>
          <div className="text-xs text-green-400 font-mono">
            {((cashMetrics.total_revenue / cashMetrics.monthly_target) * 100).toFixed(1)}% of target
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-mono text-gray-400">TRANSACTIONS</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{cashMetrics.transactions_today}</div>
          <div className="text-xs text-blue-400 font-mono">today</div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-mono text-gray-400">PATRONS</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{cashMetrics.patreon_subscribers}</div>
          <div className="text-xs text-purple-400 font-mono">active subscribers</div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-mono text-gray-400">CRYPTO</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">${cashMetrics.crypto_balance_usd.toFixed(2)}</div>
          <div className="text-xs text-orange-400 font-mono">portfolio value</div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-red-400" />
            <span className="text-xs font-mono text-gray-400">GOALS</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{cashMetrics.active_goals}</div>
          <div className="text-xs text-red-400 font-mono">active</div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <PiggyBank className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-mono text-gray-400">N26 BALANCE</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">€{cashMetrics.n26_balance.toFixed(2)}</div>
          <div className="text-xs text-yellow-400 font-mono">available</div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Target className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">FINANCIAL GOALS</h2>
        </div>

        <div className="space-y-4">
          {financialGoals.map((goal) => (
            <div key={goal.id} className="bg-gray-800 border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-mono text-white font-bold">{goal.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{goal.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white">
                    {goal.currency === "subscribers" || goal.currency === "USD"
                      ? `${goal.current_amount}/${goal.target_amount}`
                      : `€${goal.current_amount.toFixed(2)}/€${goal.target_amount.toFixed(2)}`}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-700 h-2 mb-2">
                <div
                  className={`h-2 ${
                    goal.progress >= 90
                      ? "bg-green-600"
                      : goal.progress >= 70
                        ? "bg-yellow-600"
                        : goal.progress >= 50
                          ? "bg-blue-600"
                          : "bg-red-600"
                  }`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">{goal.progress.toFixed(1)}% complete</span>
                <span
                  className={`${
                    goal.status === "active"
                      ? "text-green-400"
                      : goal.status === "completed"
                        ? "text-blue-400"
                        : "text-red-400"
                  }`}
                >
                  {goal.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
