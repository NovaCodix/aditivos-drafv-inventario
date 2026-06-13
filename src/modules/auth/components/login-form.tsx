'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { loginSchema, type LoginFormValues } from '@/shared/schemas'
import { signIn } from '@/modules/auth/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      const result = await signIn(values)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.includes('NEXT_REDIRECT')) {
        throw error
      }
      toast.error('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-slide-up w-full">
      {/* Tarjeta del Formulario Blanca */}
      <div className="bg-white border-0 rounded-[24px] px-8 py-6 sm:px-10 sm:py-8 shadow-2xl relative overflow-hidden">
        
        {/* Logo y Títulos */}
        <div className="text-center mb-6">
          <div className="flex justify-center -mt-6 sm:-mt-8 mb-0">
            <Image 
              src="/logo-drafv.webp" 
              alt="DRAFV Logo" 
              width={140} 
              height={56} 
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="text-[22px] font-black tracking-wide text-slate-900 mb-3 uppercase -mt-3">
            APP INVENTARIO
          </h1>
          <h2 className="text-base font-bold text-slate-800 mb-1.5">
            Iniciar sesión en la cuenta
          </h2>
          <p className="text-[13px] text-slate-500 font-medium">
            Ingrese su usuario y contraseña para iniciar sesión
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo: Usuario */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-600 ml-1">
              Usuario
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="ejemplo@gmail.com"
              autoComplete="username"
              className="h-11 rounded-lg border-slate-300 text-sm focus:ring-2 focus:ring-slate-400 placeholder:text-slate-400 font-medium text-slate-700 bg-white"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-xs ml-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Campo: Contraseña */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-slate-600 ml-1">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                autoComplete="current-password"
                className="h-11 rounded-lg border-slate-300 pr-10 text-sm focus:ring-2 focus:ring-slate-400 placeholder:text-slate-400 font-medium text-slate-700 bg-white"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs ml-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Recordarme */}
          <div className="flex items-center space-x-2 pt-1 pb-3">
            <Checkbox id="remember" className="rounded-sm border-slate-400 data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600" />
            <label
              htmlFor="remember"
              className="text-xs font-medium leading-none text-slate-600 cursor-pointer"
            >
              Recordarme
            </label>
          </div>

          {/* Botón de Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-full bg-[#94A3B8] hover:bg-[#64748B] text-white font-bold text-sm transition-all border-0 shadow-sm"
            disabled={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
