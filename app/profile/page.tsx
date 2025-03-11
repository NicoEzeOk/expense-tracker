"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    setFormData({
      name: user.user_metadata?.name || '',
      email: user.email || ''
    })
  }, [isAuthenticated, user, router])

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.profile-menu')) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
        data: { name: formData.name }
      })

      if (error) throw error

      setSuccess('¡Perfil actualizado exitosamente!')
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-md">
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
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Transacciones
                </Link>
                <Link
                  href="/reports"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Informes
                </Link>
                <Link
                  href="/categories"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Categorías
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative profile-menu">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProfileMenu(!showProfileMenu)
                  }}
                  className="flex items-center space-x-2 hover:bg-violet-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.user_metadata?.name || 'Usuario'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <span>⚙️</span>
                        <span>Editar perfil</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span>🚪</span>
                        <span>Cerrar sesión</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8">Perfil de Usuario</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Al cambiar tu email, necesitarás verificar la nueva dirección.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la cuenta</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID de usuario:</span> {user?.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Último inicio de sesión:</span>{' '}
                {new Date(user?.last_sign_in_at || '').toLocaleString('es-ES')}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email verificado:</span>{' '}
                {user?.email_confirmed_at ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-10 md:hidden">
        <Link
          href="/dashboard"
          className="flex flex-col items-center p-2 rounded-lg text-gray-500"
        >
          <span className="text-xl">📊</span>
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link
          href="/transactions"
          className="flex flex-col items-center p-2 rounded-lg text-gray-500"
        >
          <span className="text-xl">📝</span>
          <span className="text-xs mt-1">Transacciones</span>
        </Link>
        <Link
          href="/reports"
          className="flex flex-col items-center p-2 rounded-lg text-gray-500"
        >
          <span className="text-xl">📈</span>
          <span className="text-xs mt-1">Informes</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center p-2 rounded-lg text-violet-600 bg-violet-50"
        >
          <span className="text-xl">👤</span>
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  )
} 