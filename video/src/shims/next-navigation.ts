const router = { push() {}, replace() {}, back() {}, forward() {}, refresh() {}, prefetch() {} }

export function useRouter() {
  return router
}

export function usePathname() {
  return "/components"
}

export function useSearchParams() {
  return new URLSearchParams()
}
