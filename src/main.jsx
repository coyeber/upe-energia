import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

const clerkPublishableKey=String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY||'').trim()

function Root(){
  if(!clerkPublishableKey){
    return <AuthProvider><App/></AuthProvider>
  }

  return <ClerkProvider
    publishableKey={clerkPublishableKey}
    signInFallbackRedirectUrl="/"
    signUpFallbackRedirectUrl="/"
  >
    <AuthProvider><App/></AuthProvider>
  </ClerkProvider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root/></React.StrictMode>
)
