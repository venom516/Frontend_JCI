/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				'50': '#eef3fa',
  				'100': '#d4e2f2',
  				'200': '#a9c5e5',
  				'300': '#7da8d8',
  				'400': '#528bcb',
  				'500': '#3A67B1',
  				'600': '#2e528e',
  				'700': '#233e6a',
  				'800': '#172947',
  				'900': '#0c1523',
  				'950': '#060a12',
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)',
  				gold: '#EDBE38',
  				seafoam: '#56BDA3',
  				amber: '#EDBE38',
  				emerald: '#56BDA3',
  				rose: '#f43f5e',
  				cyan: '#0097D7',
  				violet: '#8b5cf6'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
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
  			},
  			surface: {
  				'50': '#f8f9fd',
  				'100': '#eef1fa',
  				'200': '#d4daf2',
  				'300': '#b3bde7',
  				'400': '#8d9bda',
  				'500': '#6a7ac9',
  				'600': '#4a5ab0',
  				'700': '#3a4789',
  				'800': '#2c3565',
  				'900': '#1f2649',
  				'950': '#0A0F29'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'Helvetica Neue',
  				'Helvetica',
  				'Arial',
  				'sans-serif'
  			],
  			display: [
  				'Inter',
  				'Helvetica Neue',
  				'Helvetica',
  				'Arial',
  				'sans-serif'
  			]
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
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s ease-out',
  			'fade-in': 'fade-in 0.6s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
