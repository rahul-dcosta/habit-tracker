// app/layout.js
import './globals.css'

export const metadata = {
  title: 'Habit Tracker',
  description: 'Track your daily habits and build better routines',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
