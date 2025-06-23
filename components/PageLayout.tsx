import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`app-page ${className}`}>
      <div className="app-container">
        {children}
      </div>
    </div>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="loading-page">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p>{message}</p>
      </div>
    </div>
  )
} 