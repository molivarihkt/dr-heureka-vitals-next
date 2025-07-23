'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
export function usePushWithQuery() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    href,
    options = {}
  ) => {
    const [base, query] = href.split('?')
    const merged = (base || pathname)
        + (query || searchParams.toString() ? '?' : '')
        + (query ? query + "&" : '')
        + (searchParams.toString() ? searchParams.toString() : '')
    router.push(merged, options)
  }
}
