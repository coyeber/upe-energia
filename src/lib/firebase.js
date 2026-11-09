import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig={
  apiKey:'AIzaSyAyRMCMI6c-8gX_1Re7hU5OvNUIn2-1u3A',
  authDomain:'poli-energia.firebaseapp.com',
  projectId:'poli-energia',
  storageBucket:'poli-energia.firebasestorage.app',
  messagingSenderId:'1035909230135',
  appId:'1:1035909230135:web:335fabe2dc81cc6558d9b2',
  measurementId:'G-MPFHF1SDNP'
}

export const firebaseConfigured=Boolean(firebaseConfig.apiKey&&firebaseConfig.authDomain&&firebaseConfig.projectId)
export const firebaseApp=getApps().length?getApp():initializeApp(firebaseConfig)
export const firebaseAuth=getAuth(firebaseApp)
