"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Transaction } from '@/types/transaction'
import { fetchTransactions, deleteTransaction } from '@/lib/db'
import ConfirmModal from '@/components/ConfirmModal'
import AlertModal from '@/components/AlertModal'

export default function TransactionsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Estados para los modales
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; transactionId: string }>({
    show: false,
    transactionId: ''
  })
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  })

  // Categorías predefinidas
  const categories = {
    expense: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Otros'],
    income: ['Salario', 'Freelance', 'Inversiones', 'Regalos', 'Otros']
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

  const handleDeleteTransaction = async (transactionId: string) => {
    setConfirmDelete({
      show: true,
      transactionId
    })
  }

  const confirmDeleteTransaction = async () => {
    try {
      await deleteTransaction(confirmDelete.transactionId)
      setTransactions(prev => prev.filter(t => t.id !== confirmDelete.transactionId))
      setAlert({
        show: true,
        title: 'Transacción eliminada',
        message: 'La transacción ha sido eliminada exitosamente.',
        type: 'success'
      })
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setAlert({
        show: true,
        title: 'Error',
        message: 'Error al eliminar la transacción. Por favor, intenta de nuevo.',
        type: 'error'
      })
    } finally {
      setConfirmDelete({ show: false, transactionId: '' })
    }
  }

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || transaction.type === filterType
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory
      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime()
      } else {
        return sortOrder === 'desc' 
          ? b.amount - a.amount
          : a.amount - b.amount
      }
    })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

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
                  className="text-sm font-medium text-violet-600 dark:text-violet-400"
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

        {/* Filters and Search */}
        <div className="animate-fadeIn bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descripción o categoría"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              >
                <option value="all">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              >
                <option value="all">Todas</option>
                {filterType === 'all' ? (
                  <>
                    {[...categories.income, ...categories.expense].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </>
                ) : (
                  categories[filterType === 'income' ? 'income' : 'expense'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                >
                  <option value="date">Fecha</option>
                  <option value="amount">Monto</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="animate-fadeInUp [animation-delay:300ms] bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                      Cargando transacciones...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No se encontraron transacciones
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 animate-fadeIn`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <span className="mr-2">{transaction.icon}</span>
                          {transaction.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/dashboard?edit=${transaction.id}`)}
                          className="text-violet-600 dark:text-violet-400 hover:text-violet-900 dark:hover:text-violet-300 mr-3"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modales */}
      <ConfirmModal
        isOpen={confirmDelete.show}
        title="Eliminar transacción"
        message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteTransaction}
        onCancel={() => setConfirmDelete({ show: false, transactionId: '' })}
      />

      <AlertModal
        isOpen={alert.show}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      />
    </div>
  )
} 