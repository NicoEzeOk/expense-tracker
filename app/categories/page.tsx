"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Transaction } from '@/types/transaction'
import { fetchTransactions } from '@/lib/db'

export default function CategoriesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')

  // Categorías predefinidas
  const categories = {
    expense: [
      { name: 'Alimentación', icon: '🛒', description: 'Comida, bebidas y víveres' },
      { name: 'Transporte', icon: '🚗', description: 'Gasolina, transporte público, mantenimiento' },
      { name: 'Vivienda', icon: '🏠', description: 'Alquiler, hipoteca, servicios' },
      { name: 'Servicios', icon: '💡', description: 'Electricidad, agua, internet, teléfono' },
      { name: 'Entretenimiento', icon: '🎮', description: 'Ocio, deportes, eventos' },
      { name: 'Salud', icon: '⚕️', description: 'Médico, medicamentos, seguros' },
      { name: 'Otros', icon: '📦', description: 'Gastos varios no categorizados' }
    ],
    income: [
      { name: 'Salario', icon: '💰', description: 'Ingresos por trabajo en relación de dependencia' },
      { name: 'Freelance', icon: '💻', description: 'Ingresos por trabajo independiente' },
      { name: 'Inversiones', icon: '📈', description: 'Rendimientos de inversiones' },
      { name: 'Regalos', icon: '🎁', description: 'Ingresos por regalos o premios' },
      { name: 'Otros', icon: '💵', description: 'Ingresos varios no categorizados' }
    ]
  }

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

  // Calcular estadísticas por categoría
  const getCategoryStats = (categoryName: string, type: 'expense' | 'income') => {
    const categoryTransactions = transactions.filter(
      t => t.type === type && t.category === categoryName
    )
    
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
    const count = categoryTransactions.length
    const average = count > 0 ? total / count : 0

    return { total, count, average }
  }

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
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Informes
                </Link>
                <Link
                  href="/categories"
                  className="text-sm font-medium text-violet-600 dark:text-violet-400"
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
        {/* Tab Selector */}
        <div className="animate-fadeIn bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categorías</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 ${
                  activeTab === 'expense'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Gastos
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 ${
                  activeTab === 'income'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Ingresos
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories[activeTab].map((category, index) => {
            const stats = getCategoryStats(category.name, activeTab)
            return (
              <div 
                key={category.name} 
                className="animate-fadeInUp bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm animate-fadeIn" style={{ animationDelay: `${index * 100 + 100}ms` }}>
                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">${stats.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm animate-fadeIn" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                    <span className="text-gray-500 dark:text-gray-400">Transacciones</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{stats.count}</span>
                  </div>
                  <div className="flex justify-between text-sm animate-fadeIn" style={{ animationDelay: `${index * 100 + 300}ms` }}>
                    <span className="text-gray-500 dark:text-gray-400">Promedio</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">${stats.average.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/transactions?category=${category.name}&type=${activeTab}`}
                    className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transform transition-all duration-200 hover:translate-x-2 inline-block"
                  >
                    Ver transacciones →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
} 