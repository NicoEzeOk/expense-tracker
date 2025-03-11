import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">🗺️</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                MoneyMap
              </h1>
            </div>
            <nav className="flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                Características
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                Cómo funciona
              </a>
              <Link
                href="/login"
                className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 px-4 py-2 rounded-lg border border-violet-600 dark:border-violet-400 transition-colors"
              >
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fadeInUp">
            Controla tus finanzas con
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> MoneyMap</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto animate-fadeInUp [animation-delay:200ms]">
            La forma más inteligente de gestionar tus ingresos y gastos. Obtén insights valiosos sobre tus hábitos financieros y toma mejores decisiones.
          </p>
          <div className="flex justify-center space-x-4 animate-fadeInUp [animation-delay:400ms]">
            <Link
              href="/register"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              Comenzar gratis
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 rounded-lg font-medium border border-violet-600 dark:border-violet-400 transition-colors"
            >
              Saber más
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 animate-fadeIn">
            Todo lo que necesitas para gestionar tus finanzas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl animate-fadeInUp hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Seguimiento detallado
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Registra y categoriza tus ingresos y gastos de manera sencilla. Mantén un control preciso de tu dinero.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl animate-fadeInUp [animation-delay:200ms] hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Informes visuales
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualiza tus patrones de gasto con gráficos intuitivos. Identifica oportunidades de ahorro fácilmente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl animate-fadeInUp [animation-delay:400ms] hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Categorización inteligente
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organiza tus transacciones en categorías personalizadas. Entiende mejor en qué gastas tu dinero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 animate-fadeIn">
            Cómo funciona MoneyMap
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4 animate-fadeInUp">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-violet-600 dark:text-violet-400">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Registra tus transacciones
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Añade fácilmente tus ingresos y gastos. Clasifícalos por categorías y añade descripciones para un mejor seguimiento.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 animate-fadeInUp [animation-delay:200ms]">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-violet-600 dark:text-violet-400">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Visualiza tus finanzas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Accede a informes detallados y gráficos que te muestran exactamente cómo se mueve tu dinero.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 animate-fadeInUp [animation-delay:400ms]">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-violet-600 dark:text-violet-400">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Toma mejores decisiones
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Utiliza los insights para optimizar tus gastos y mejorar tus hábitos financieros.
                  </p>
                </div>
              </div>
            </div>

            {/* Example Dashboard Image */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl animate-fadeInUp">
              <div className="aspect-video bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 animate-fadeIn">
            Comienza a controlar tus finanzas hoy
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-fadeIn [animation-delay:200ms]">
            Únete a miles de personas que ya están mejorando su salud financiera con MoneyMap.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-violet-600 rounded-lg font-medium hover:bg-gray-100 transition-colors animate-fadeIn [animation-delay:400ms]"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-sm">🗺️</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                MoneyMap
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 MoneyMap. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

