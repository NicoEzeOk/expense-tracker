"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Transaction, NewTransaction } from '@/types/transaction'
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/lib/db'
import TransactionFormModal from '@/components/TransactionFormModal'
import AlertModal from '@/components/AlertModal'
import ThemeToggle from '@/components/ThemeToggle'

interface TransactionFormData {
  type: 'income' | 'expense'
  amount: string
  category: string
  description: string
  date: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [alertState, setAlertState] = useState<{
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

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Categorías predefinidas
  const categories = {
    expense: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Otros'],
    income: ['Salario', 'Freelance', 'Inversiones', 'Regalos', 'Otros']
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitTransaction = async (formData: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) {
      setAlertState({
        show: true,
        title: 'Error',
        message: 'Debes iniciar sesión para realizar esta acción',
        type: 'error'
      })
      return
    }

    try {
      if (editingTransaction) {
        const updatedTransaction = await updateTransaction(editingTransaction.id, formData)
        setTransactions(prev => 
          prev.map(t => t.id === editingTransaction.id ? updatedTransaction : t)
        )
        setAlertState({
          show: true,
          title: 'Éxito',
          message: 'Transacción actualizada exitosamente',
          type: 'success'
        })
      } else {
        const newTransaction = await createTransaction(formData, user.id)
        setTransactions(prev => [newTransaction, ...prev])
        setAlertState({
          show: true,
          title: 'Éxito',
          message: 'Transacción creada exitosamente',
          type: 'success'
        })
      }
      
      setShowTransactionModal(false)
      setEditingTransaction(null)
    } catch (error: any) {
      console.error('Error saving transaction:', error)
      setAlertState({
        show: true,
        title: 'Error',
        message: `Error al guardar la transacción: ${error.message || 'Por favor, intenta de nuevo.'}`,
        type: 'error'
      })
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para realizar esta acción')
      return
    }

    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      try {
        await deleteTransaction(transactionId)
        setTransactions(prev => prev.filter(t => t.id !== transactionId))
      } catch (error: any) {
        console.error('Error deleting transaction:', error)
        alert(`Error al eliminar la transacción: ${error.message || 'Por favor, intenta de nuevo.'}`)
      }
    }
  }

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      'Alimentación': '🛒',
      'Transporte': '🚗',
      'Vivienda': '🏠',
      'Servicios': '💡',
      'Entretenimiento': '🎮',
      'Salud': '⚕️',
      'Otros': '📦',
      'Salario': '💰',
      'Freelance': '💻',
      'Inversiones': '📈',
      'Regalos': '🎁'
    }
    return icons[category] || '💵'
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleAddTransaction = () => {
    setShowTransactionModal(true)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
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
                <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  MoneyMap
                </h1>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium ${
                    activeTab === 'dashboard' 
                      ? 'text-violet-600 dark:text-violet-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className={`text-sm font-medium ${
                    activeTab === 'transactions' 
                      ? 'text-violet-600 dark:text-violet-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Transacciones
                </Link>
                <Link
                  href="/reports"
                  className={`text-sm font-medium ${
                    activeTab === 'reports' 
                      ? 'text-violet-600 dark:text-violet-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Informes
                </Link>
                <Link
                  href="/categories"
                  className={`text-sm font-medium ${
                    activeTab === 'categories' 
                      ? 'text-violet-600 dark:text-violet-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Categorías
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.user_metadata?.name || 'Usuario'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-200">
                ¡Hola, {user?.user_metadata?.name || 'Usuario'}! 👋
              </h2>
              <p className="text-base text-gray-600 mt-1 tracking-normal dark:text-gray-400">Bienvenido a tu mapa financiero personal</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={handleAddTransaction}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-violet-700 hover:to-indigo-700 transition-all flex items-center"
              >
                <span className="mr-2">➕</span> Nueva transacción
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-800 rounded-lg p-3">
                  <span className="text-2xl">💸</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium tracking-tight text-gray-500 dark:text-gray-400 truncate">Ingresos totales</dt>
                    <dd className="text-2xl font-semibold tracking-tighter text-green-600 dark:text-green-400">${totalIncome.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-800 px-6 py-2">
              <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+12% vs. mes anterior</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 dark:bg-red-800 rounded-lg p-3">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium tracking-tight text-gray-500 dark:text-gray-400 truncate">Gastos totales</dt>
                    <dd className="text-2xl font-semibold tracking-tighter text-red-600 dark:text-red-400">${totalExpense.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-800 px-6 py-2">
              <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>+5% vs. mes anterior</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-800 rounded-lg p-3">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium tracking-tight text-gray-500 dark:text-gray-400 truncate">Balance</dt>
                    <dd className="text-2xl font-semibold tracking-tighter text-blue-600 dark:text-blue-400">${balance.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-800 px-6 py-2">
              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+7% vs. mes anterior</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200 flex items-center">
              <span className="mr-2">📝</span> Transacciones recientes
            </h3>
            <button className="text-violet-600 dark:text-violet-400 hover:text-violet-800 text-sm font-medium transition-colors">
              Ver todas
            </button>
          </div>
          <div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-full p-2 ${
                        transaction.type === 'income' ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'
                      }`}>
                        <span className="text-xl">{transaction.icon}</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium tracking-tight text-gray-900 dark:text-gray-200">{transaction.description}</p>
                        <p className="text-xs tracking-normal text-gray-500 dark:text-gray-400">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-violet-600 dark:text-violet-400 hover:text-violet-800"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
            <h3 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <span className="mr-2">📊</span> Gastos por categoría
            </h3>
            <div className="space-y-4">
              {categories.expense.map(category => {
                const totalForCategory = transactions
                  .filter(t => t.type === 'expense' && t.category === category)
                  .reduce((sum, t) => sum + t.amount, 0)
                
                const percentage = totalExpense > 0 
                  ? (totalForCategory / totalExpense) * 100 
                  : 0

                return (
                  <div key={category} className="relative">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-300">
                        ${totalForCategory.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-violet-600 dark:bg-violet-400 h-2.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
            <h3 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <span className="mr-2">📅</span> Ingresos vs. Gastos
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium tracking-tight text-green-600 dark:text-green-400">Ingresos</span>
                  <span className="text-sm font-medium tracking-tight text-green-600 dark:text-green-400">${totalIncome.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-green-500 dark:bg-green-400 h-4 rounded-full"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium tracking-tight text-red-600 dark:text-red-400">Gastos</span>
                  <span className="text-sm font-medium tracking-tight text-red-600 dark:text-red-400">${totalExpense.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-red-500 dark:bg-red-400 h-4 rounded-full"
                    style={{ width: `${(totalExpense / totalIncome) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <span className="mr-2">⚡</span> Acciones rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, type: 'income' }))
                setShowTransactionModal(true)
              }}
              className="bg-violet-50 dark:bg-violet-800 hover:bg-violet-100 dark:hover:bg-violet-700 transition-colors p-4 rounded-xl flex flex-col items-center"
            >
              <span className="text-2xl mb-2">💰</span>
              <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-300">Añadir ingreso</span>
            </button>
            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, type: 'expense' }))
                setShowTransactionModal(true)
              }}
              className="bg-violet-50 dark:bg-violet-800 hover:bg-violet-100 dark:hover:bg-violet-700 transition-colors p-4 rounded-xl flex flex-col items-center"
            >
              <span className="text-2xl mb-2">💳</span>
              <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-300">Añadir gasto</span>
            </button>
            <Link
              href="/reports"
              className="bg-violet-50 dark:bg-violet-800 hover:bg-violet-100 dark:hover:bg-violet-700 transition-colors p-4 rounded-xl flex flex-col items-center"
            >
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-300">Ver informes</span>
            </Link>
            <Link
              href="/categories"
              className="bg-violet-50 dark:bg-violet-800 hover:bg-violet-100 dark:hover:bg-violet-700 transition-colors p-4 rounded-xl flex flex-col items-center"
            >
              <span className="text-2xl mb-2">⚙️</span>
              <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-300">Categorías</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-10 md:hidden">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'dashboard' ? 'text-violet-600 bg-violet-50' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link
          href="/transactions"
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'transactions' ? 'text-violet-600 bg-violet-50' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">📝</span>
          <span className="text-xs mt-1">Transacciones</span>
        </Link>
        <button
          onClick={handleAddTransaction}
          className="flex flex-col items-center p-2 rounded-lg text-white bg-gradient-to-r from-violet-600 to-indigo-600"
        >
          <span className="text-xl">➕</span>
          <span className="text-xs mt-1">Añadir</span>
        </button>
        <Link
          href="/reports"
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'reports' ? 'text-violet-600 bg-violet-50' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">📈</span>
          <span className="text-xs mt-1">Informes</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'profile' ? 'text-violet-600 bg-violet-50' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>

      {/* Modales */}
      <TransactionFormModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false)
          setEditingTransaction(null)
        }}
        onSubmit={handleSubmitTransaction}
        initialData={editingTransaction || undefined}
        type={editingTransaction?.type || 'expense'}
      />

      <AlertModal
        isOpen={alertState.show}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, show: false }))}
      />
    </div>
  )
}

