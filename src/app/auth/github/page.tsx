'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'

// 검색 매개변수를 사용하는 컴포넌트를 분리
function GitHubAuthContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const { status } = useSession()

  useEffect(() => {
    if (status === 'loading') {
      return // 세션 로딩 중이면 기다림
    }

    if (status === 'authenticated') {
      // 이미 인증된 경우 대시보드로 이동
      router.push('/dashboard')
      return
    }

    const errorParam = searchParams.get('error')
    if (errorParam) {
      setIsLoading(false)
      setError(`GitHub 인증 중 오류가 발생했습니다: ${errorParam}`)
      return
    }

    // 인증 시작
    const startAuth = async () => {
      try {
        setIsLoading(true)
        // callbackUrl에서 http://가 있는지 확인하여 전체 URL인지 상대 경로인지 판단
        let finalCallbackUrl = callbackUrl;
        if (!callbackUrl.startsWith('http')) {
          // 상대 경로인 경우에만 baseUrl 추가
          const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
            : process.env.NEXTAUTH_URL || 'http://localhost:3000';
          finalCallbackUrl = baseUrl + (callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`);
        }
        
        // 일반 로그인 처리
        await signIn('github', { callbackUrl: finalCallbackUrl, redirect: false });
      } catch (err) {
        setIsLoading(false)
        setError('GitHub 인증을 시작하는 중 오류가 발생했습니다.')
      }
    }

    startAuth()
  }, [router, searchParams, callbackUrl, status])

  return (
    <div className="bg-white shadow-md rounded-lg max-w-md w-full p-8 text-center">
      <div className="mb-6">
        <svg className="mx-auto h-12 w-12 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold text-primary-900 mb-2">GitHub 인증</h1>
      
      {isLoading ? (
        <div className="mt-6">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
          <p className="text-primary-600">GitHub 계정에 연결 중입니다...</p>
        </div>
      ) : error ? (
        <div className="mt-6">
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button 
            onClick={() => signIn('github', { callbackUrl })}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-50 bg-primary-700 hover:bg-primary-600 gap-2"
          >
            <img 
              src="/images/github_login.png" 
              alt="GitHub 로고" 
              className="w-5 h-5"
            />
            다시 시도하기
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <p className="text-green-700">연결 중... 대시보드로 이동합니다</p>
          </div>
        </div>
      )}
      
      <p className="mt-8 text-sm text-primary-500">
        GitHub 계정을 연결하면 Contribase가 공개 저장소에 접근할 수 있게 됩니다. 
        저희는 귀하의 개인 정보를 보호하며, 모든 분석은 클라이언트 측에서 처리됩니다.
      </p>
    </div>
  )
}

// 로딩 상태를 표시할 폴백 컴포넌트
function LoadingFallback() {
  return (
    <div className="bg-white shadow-md rounded-lg max-w-md w-full p-8 text-center">
      <div className="mb-6">
        <svg className="mx-auto h-12 w-12 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold text-primary-900 mb-2">GitHub 인증</h1>
      
      <div className="mt-6">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        <p className="text-primary-600">로딩 중...</p>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function GitHubAuth() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-primary-50">
      <Suspense fallback={<LoadingFallback />}>
        <GitHubAuthContent />
      </Suspense>
    </div>
  )
} 