"use client"

import { cryptoWallets } from "@/lib/cash-agent-data"
import { Wallet, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CryptoWallets() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkColor = (network: string) => {
    switch (network.toLowerCase()) {
      case "solana":
        return "text-purple-400"
      case "ethereum":
        return "text-blue-400"
      case "bitcoin":
        return "text-orange-400"
      case "polygon":
        return "text-indigo-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wallet className="h-5 w-5 text-red-600" />
        <h2 className="text-lg font-bold text-white font-mono">CRYPTO WALLETS</h2>
      </div>

      <div className="space-y-4">
        {cryptoWallets.map((wallet, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    wallet.network === "Solana"
                      ? "bg-purple-500"
                      : wallet.network === "Ethereum"
                        ? "bg-blue-500"
                        : wallet.network === "Bitcoin"
                          ? "bg-orange-500"
                          : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <div className={`text-sm font-mono font-bold ${getNetworkColor(wallet.network)}`}>
                    {wallet.network}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{truncateAddress(wallet.address)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.address)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-400">BALANCE:</span>
                <span className="text-white ml-2">
                  {wallet.balance} {wallet.currency}
                </span>
              </div>
              <div>
                <span className="text-gray-400">USD VALUE:</span>
                <span className="text-green-400 ml-2">${wallet.usd_value.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Total Portfolio Value */}
        <div className="bg-gray-900 border border-red-600 p-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-gray-400">TOTAL PORTFOLIO VALUE</span>
            <span className="text-lg font-mono font-bold text-green-400">
              ${cryptoWallets.reduce((sum, wallet) => sum + wallet.usd_value, 0).toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
