'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { LoginRequest } from '@/services/authService'

export async function loginSession(data: LoginRequest) {
  const cookieStore = await cookies()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  try {
    const response = await fetch(`${apiUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMessage = 'Erro ao realizar login'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {}
      throw new Error(errorMessage)
    }

    const responseData = await response.json()
    const setCookieHeader = response.headers.get('set-cookie')

    const getCookieValue = (name: string) => {
      if (!setCookieHeader) return null
      const match = setCookieHeader.match(new RegExp(`${name}=([^;]+)`))
      return match ? match[1] : null
    }

    const token = responseData.token || responseData.accessToken || responseData.access_token || responseData.acess_token || getCookieValue('access_token') || getCookieValue('acess_token')
    const refreshToken = responseData.refreshToken || responseData.refresh_token || getCookieValue('refresh_token') || getCookieValue('refreshToken')

    // Padrão de produção (seguro)
    let cookieOptions: { secure: boolean, sameSite: 'lax' | 'none' } = { secure: true, sameSite: 'none' }

    try {
      const headersList = await headers()
      const host = headersList.get('host')
      const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1')
      
      if (isLocal) {
        cookieOptions = { secure: false, sameSite: 'lax' }
      }
    } catch (e) {
      console.error('Erro ao acessar headers:', e)
    }

    if (token) {
      cookieStore.set('access_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 15, // 15 minutos
        ...cookieOptions
      })
    }

    if (refreshToken) {
      cookieStore.set('refresh_token', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        ...cookieOptions
      })
    }

    return { success: true }
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error
    console.error('Login Error:', error.message)
    if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      throw new Error('Falha na conexão com o servidor')
    }
    throw new Error(error?.message ?? 'Falha na conexão com o servidor')
  }
}

export async function refreshSession() {
  const cookieStore = await cookies()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const refreshTokenValue = cookieStore.get('refresh_token')?.value || cookieStore.get('refreshToken')?.value

  console.log('[refreshSession] Iniciando renovação única. Token encontrado:', !!refreshTokenValue)

  if (!refreshTokenValue) return { success: false }

  try {
    const response = await fetch(`${apiUrl}/admin/refresh-token`, {
      method: 'POST',
      headers: { 'Cookie': `refresh_token=${refreshTokenValue}` },
    })

    console.log('[refreshSession] Resposta do backend status:', response.status)

    if (!response.ok) return { success: false }

    const responseData = await response.json()
    const setCookieHeader = response.headers.get('set-cookie')

    const getCookieValue = (name: string) => {
      if (!setCookieHeader) return null
      const match = setCookieHeader.match(new RegExp(`${name}=([^;]+)`))
      return match ? match[1] : null
    }

    const token = responseData.token || responseData.accessToken || responseData.access_token || responseData.acess_token || getCookieValue('access_token') || getCookieValue('acess_token')
    const newRefresh = responseData.refreshToken || responseData.refresh_token || getCookieValue('refresh_token') || getCookieValue('refreshToken')

    // Padrão de produção (seguro)
    let cookieOptions: { secure: boolean, sameSite: 'lax' | 'none' } = { secure: true, sameSite: 'none' }

    try {
      const headersList = await headers()
      const host = headersList.get('host')
      const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1')
      
      if (isLocal) {
        cookieOptions = { secure: false, sameSite: 'lax' }
      }
    } catch (e) {
      console.error('Erro ao acessar headers:', e)
    }

    if (token) {
      cookieStore.set('access_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 15,
        ...cookieOptions
      })
      
      if (newRefresh) {
        cookieStore.set('refresh_token', newRefresh, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          ...cookieOptions
        })
      }
      
      console.log('[refreshSession] Novos tokens obtidos com sucesso!')
      return { success: true }
    }
    
    return { success: false }
  } catch (error: any) {
    console.error('[refreshSession] Erro na renovação:', error.message)
    return { success: false }
  }
}

export async function logoutSession() {
  const cookieStore = await cookies()
  const names = ['token', 'acess_token', 'access_token', 'refreshToken', 'refresh_token']
  names.forEach(name => cookieStore.delete(name))
  // Retornamos sucesso para o cliente fazer o redirecionamento manual
  return { success: true }
}
