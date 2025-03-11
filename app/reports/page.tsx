"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Transaction } from '@/types/transaction'
import { fetchTransactions } from '@/lib/db'

export default function ReportsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions(user.id)
        setTransactions(data)
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [isAuthenticated, user, router])

  // Función para filtrar transacciones por período
  const filterTransactionsByPeriod = (transactions: Transaction[]) => {
    const now = new Date()
    const periods = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1)
    }

    return transactions.filter(t => 
      new Date(t.date) >= periods[selectedPeriod]
    )
  }

  const filteredTransactions = filterTransactionsByPeriod(transactions)

  // Cálculos para el resumen
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Cálculos por categoría
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const incomesByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  // Cálculos por día
  const transactionsByDay = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString('es-ES')
    if (!acc[date]) {
      acc[date] = { income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      acc[date].income += t.amount
    } else {
      acc[date].expense += t.amount
    }
    return acc
  }, {} as Record<string, { income: number, expense: number }>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">🗺️</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  MoneyMap
                </h1>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Transacciones
                </Link>
                <Link
                  href="/reports"
                  className="text-sm font-medium text-violet-600 dark:text-violet-400"
                >
                  Informes
                </Link>
                <Link
                  href="/categories"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Categorías
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="animate-fadeIn bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Período de análisis</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 ${
                  selectedPeriod === 'week'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 ${
                  selectedPeriod === 'month'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setSelectedPeriod('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 ${
                  selectedPeriod === 'year'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Año
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="animate-fadeInUp bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-lg p-3">
                  <span className="text-2xl">💸</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Ingresos totales</dt>
                    <dd className="text-2xl font-semibold text-green-600 dark:text-green-400">${totalIncome.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fadeInUp [animation-delay:200ms] bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-lg p-3">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Gastos totales</dt>
                    <dd className="text-2xl font-semibold text-red-600 dark:text-red-400">${totalExpense.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fadeInUp [animation-delay:400ms] bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Balance</dt>
                    <dd className="text-2xl font-semibold text-blue-600 dark:text-blue-400">${balance.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gastos por Categoría */}
          <div className="animate-fadeInUp [animation-delay:300ms] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Gastos por Categoría</h3>
            <div className="space-y-4">
              {Object.entries(expensesByCategory).map(([category, amount], index) => {
                const percentage = (amount / totalExpense) * 100
                return (
                  <div key={category} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{category}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-violet-600 dark:bg-violet-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ingresos por Categoría */}
          <div className="animate-fadeInUp [animation-delay:400ms] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Ingresos por Categoría</h3>
            <div className="space-y-4">
              {Object.entries(incomesByCategory).map(([category, amount], index) => {
                const percentage = (amount / totalIncome) * 100
                return (
                  <div key={category} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{category}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Evolución Diaria */}
          <div className="animate-fadeInUp [animation-delay:500ms] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 lg:col-span-2 hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Evolución Diaria</h3>
            <div className="space-y-4">
              {Object.entries(transactionsByDay).map(([date, { income, expense }], index) => (
                <div key={date} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{date}</span>
                    <div className="flex space-x-4">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">+${income.toFixed(2)}</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">-${expense.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="relative flex justify-between">
                      <div
                        className="h-2 bg-green-500 dark:bg-green-400 rounded transition-all duration-1000"
                        style={{ width: `${(income / Math.max(income, expense)) * 100}%` }}
                      ></div>
                      <div
                        className="h-2 bg-red-500 dark:bg-red-400 rounded transition-all duration-1000"
                        style={{ width: `${(expense / Math.max(income, expense)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 