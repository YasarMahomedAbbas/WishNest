import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		screens: {
  			'xs': '475px',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: any) {
      const newUtilities = {
        '.app-page': {
          '@apply min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100': {},
        },
        '.app-container': {
          '@apply max-w-7xl mx-auto px-4 py-8': {},
        },
        '.btn-primary': {
          '@apply bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md': {},
        },
        '.btn-danger': {
          '@apply bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md': {},
        },
        '.status-available': {
          '@apply bg-green-100 text-green-800 border-green-200 hover:bg-green-50 transition-colors duration-200': {},
        },
        '.status-reserved': {
          '@apply bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-50 transition-colors duration-200': {},
        },
        '.status-reserved-by-me': {
          '@apply bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 transition-colors duration-200 whitespace-nowrap': {},
        },
        '.status-purchased': {
          '@apply bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 transition-colors duration-200': {},
        },
        '.status-purchased-by-me': {
          '@apply bg-green-100 text-green-800 border-green-200 hover:bg-green-50 transition-colors duration-200': {},
        },
        '.text-brand': {
          '@apply bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent font-bold': {},
        },
        '.card-default': {
          '@apply rounded-2xl shadow-lg border border-slate-200': {},
        },
        '.icon-brand': {
          '@apply p-3 bg-gradient-to-r from-red-500 to-orange-400 rounded-2xl': {},
        },
        '.loading-spinner': {
          '@apply animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500': {},
        },
        '.loading-page': {
          '@apply min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center': {},
        },
        // Core Typography
        '.text-heading': {
          '@apply text-xl font-bold text-foreground': {},
        },
        '.text-body': {
          '@apply text-sm text-foreground': {},
        },
        '.text-caption': {
          '@apply text-xs text-muted-foreground': {},
        },
        '.text-price': {
          '@apply text-2xl font-bold text-primary': {},
        },
        // Core Interactive Elements  
        '.interactive-primary': {
          '@apply bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white rounded-xl transition-all duration-200': {},
        },
        '.interactive-secondary': {
          '@apply text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200 rounded-xl': {},
        },
        '.interactive-destructive': {
          '@apply border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl': {},
        },
        // Core Surfaces
        '.surface-card': {
          '@apply bg-card border border-border rounded-2xl shadow-sm': {},
        },
        '.surface-interactive': {
          '@apply surface-card hover:shadow-xl transition-all duration-300': {},
        },
        '.surface-elevated': {
          '@apply bg-accent/50 backdrop-blur-sm border border-border/50 shadow-sm rounded-2xl p-2': {},
        },
        // Core Form Elements
        '.field-input': {
          '@apply border-input rounded-xl': {},
        },
        '.field-with-icon': {
          '@apply pl-10 border-input rounded-xl': {},
        },
        // Core Layout
        '.flex-between': {
          '@apply flex items-center justify-between': {},
        },
        '.flex-center': {
          '@apply flex items-center justify-center': {},
        },
        '.content-section': {
          '@apply mt-4 pt-4 border-t border-border': {},
        },
        // Core Status
        '.status-badge': {
          '@apply inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors': {},
        },
        // Core Icons
        '.icon-container': {
          '@apply p-2 rounded-lg flex-center': {},
        }
      }
      addUtilities(newUtilities)
    }
  ],
};
export default config;
