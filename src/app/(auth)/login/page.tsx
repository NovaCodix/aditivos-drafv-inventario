import type { Metadata } from 'next'
import { LoginForm } from '@/modules/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Accede al sistema de inventario de Aditivos DRAFV',
}

export default function LoginPage() {
  return <LoginForm />
}
