'use client'
import { useRouter, usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Inicio',
    path: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L2 8v10h5v-5h6v5h5V8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Recetas',
    path: '/recetas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="13" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'IA Chef',
    path: '/ia-ingredientes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l1.6 5.4L17 10l-5.4 1.6L10 18l-1.6-5.4L3 10l5.4-1.6L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Mi libro',
    path: '/mis-recetas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 3h10a1 1 0 011 1v12a1 1 0 01-1 1H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'On-chain',
    path: '/onchain',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 2v8m0 0L3 6m7 4l7-4m-7 4v8" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <nav className="salvia-bottom-nav">
        {navItems.map(item => {
          const isActive =
            pathname === item.path ||
            (item.path !== '/dashboard' && pathname.startsWith(item.path))
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '4px', padding: '12px 0', background: 'none', border: 'none',
                cursor: 'pointer', color: isActive ? 'var(--accent-light)' : 'var(--fg-light)',
                transition: 'color .15s',
              }}
            >
              {item.icon}
              <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
      <div className="salvia-bottom-nav-spacer" />
    </>
  )
}
