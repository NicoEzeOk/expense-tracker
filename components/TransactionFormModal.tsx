import { useState, useEffect } from 'react'
import { Transaction } from '@/types/transaction'

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>
  initialData?: Transaction
  type?: 'income' | 'expense'
}

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  type: initialType = 'expense'
}: TransactionFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: initialType,
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Categorías predefinidas
  const categories = {
    expense: [
      { name: 'Alimentación', icon: '🛒' },
      { name: 'Transporte', icon: '🚗' },
      { name: 'Vivienda', icon: '🏠' },
      { name: 'Servicios', icon: '💡' },
      { name: 'Entretenimiento', icon: '🎮' },
      { name: 'Salud', icon: '⚕️' },
      { name: 'Otros', icon: '📦' }
    ],
    income: [
      { name: 'Salario', icon: '💰' },
      { name: 'Freelance', icon: '💻' },
      { name: 'Inversiones', icon: '📈' },
      { name: 'Regalos', icon: '🎁' },
      { name: 'Otros', icon: '💵' }
    ]
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        amount: initialData.amount.toString(),
        category: initialData.category,
        description: initialData.description,
        date: initialData.date
      })
    } else {
      setFormData({
        type: initialType,
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
    }
  }, [initialData, initialType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category || !formData.description) {
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        type: formData.type as 'income' | 'expense',
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        icon: formData.type === 'income' 
          ? '💰' 
          : categories.expense.find(c => c.name === formData.category)?.icon || '📦'
      })
      onClose()
    } catch (error) {
      console.error('Error submitting transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {initialData ? 'Editar' : 'Nueva'} Transacción
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Tipo de Transacción */}
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="text-sm font-medium tracking-tight text-gray-700 mb-2 block">
                Tipo de Transacción
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
                    formData.type === 'expense'
                      ? 'bg-red-100 border-red-200 text-red-700 font-medium tracking-tight'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 font-medium tracking-tight'
                  }`}
                >
                  <span className="mr-2">💳</span>
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
                    formData.type === 'income'
                      ? 'bg-green-100 border-green-200 text-green-700 font-medium tracking-tight'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 font-medium tracking-tight'
                  }`}
                >
                  <span className="mr-2">💰</span>
                  Ingreso
                </button>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="text-sm font-medium tracking-tight text-gray-700 mb-2 block">
                Monto
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-7 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-violet-500 focus:border-violet-500 font-medium tracking-tight"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-sm font-medium tracking-tight text-gray-700 mb-2 block">
                Categoría
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {categories[formData.type].map(category => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.name }))}
                    className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                      formData.category === category.name
                        ? 'bg-violet-50 border-violet-200 text-violet-700 font-medium tracking-tight'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 font-medium tracking-tight'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium tracking-tight text-gray-700 mb-2 block">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-violet-500 focus:border-violet-500 font-medium tracking-tight"
                placeholder="Descripción de la transacción"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="text-sm font-medium tracking-tight text-gray-700 mb-2 block">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-violet-500 focus:border-violet-500 font-medium tracking-tight"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium tracking-tight text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium tracking-tight text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 