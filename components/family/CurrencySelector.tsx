"use client"

import { useState } from "react"
import { DollarSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { type Family } from "./types"

interface CurrencySelectorProps {
  family: Family
  onCurrencyUpdated: (currency: 'USD' | 'EUR' | 'GBP') => void
}

const currencyOptions = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
] as const

export function CurrencySelector({ family, onCurrencyUpdated }: CurrencySelectorProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>(family.currency)

  const handleCurrencyChange = async (newCurrency: 'USD' | 'EUR' | 'GBP') => {
    if (newCurrency === family.currency) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/families/${family.id}/currency`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency: newCurrency }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedCurrency(newCurrency)
        onCurrencyUpdated(newCurrency)
        toast({
          title: "Success",
          description: `Family currency updated to ${currencyOptions.find(c => c.value === newCurrency)?.label}`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error?.message || "Failed to update currency",
          variant: "destructive",
        })
        // Reset selection on error
        setSelectedCurrency(family.currency)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update currency. Please try again.",
        variant: "destructive",
      })
      // Reset selection on error
      setSelectedCurrency(family.currency)
    } finally {
      setIsUpdating(false)
    }
  }

  if (family.membershipRole !== 'ADMIN') {
    // Show current currency for non-admins
    const currentCurrency = currencyOptions.find(c => c.value === family.currency)
    return (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-slate-500" />
        <span className="text-sm text-slate-600">
          Currency: {currentCurrency?.label}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <DollarSign className="h-4 w-4 text-slate-500" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Currency:</span>
        <Select
          value={selectedCurrency}
          onValueChange={handleCurrencyChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencyOptions.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{currency.symbol}</span>
                  <span>{currency.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isUpdating && (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        )}
      </div>
    </div>
  )
}