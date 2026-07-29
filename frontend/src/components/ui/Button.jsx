import { useTranslation } from 'react-i18next'

const variants = {
  primary: 'bg-navy text-white hover:bg-navy-600 active:bg-navy-700',
  secondary: 'bg-ivory-200 text-navy hover:bg-ivory-300 active:bg-ivory-400',
  ghost: 'bg-transparent text-navy hover:bg-ivory-100 active:bg-ivory-200',
  danger: 'bg-red text-white hover:bg-red-400 active:bg-red',
  outline: 'border border-navy bg-transparent text-navy hover:bg-ivory-100 active:bg-ivory-200',
}

const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-sm' }

export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, className, type = 'button', ...props }) {
  const { t } = useTranslation()
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center font-medium rounded-[8px] transition-all duration-[220ms] ease-out disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? t('app.loading') : children}
    </button>
  )
}
