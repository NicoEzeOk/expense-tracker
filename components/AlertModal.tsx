interface AlertModalProps {
  isOpen: boolean
  title: string
  message: string
  buttonText?: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
}

export default function AlertModal({
  isOpen,
  title,
  message,
  buttonText = 'Aceptar',
  type = 'info',
  onClose
}: AlertModalProps) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          icon: '❌',
          buttonClass: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100'
        }
      case 'success':
        return {
          icon: '✅',
          buttonClass: 'bg-green-600 hover:bg-green-700',
          iconBg: 'bg-green-100'
        }
      default:
        return {
          icon: 'ℹ️',
          buttonClass: 'bg-violet-600 hover:bg-violet-700',
          iconBg: 'bg-violet-100'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center`}>
              <span className="text-2xl">{styles.icon}</span>
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            {message}
          </p>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${styles.buttonClass}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 