// Clear all demo/mock data flags and restart fresh
console.log('🧹 Clearing all localStorage data...')

// Remove demo user flag
localStorage.removeItem('isDemoUser')

// Remove auth data
localStorage.removeItem('auth_token')
localStorage.removeItem('auth_user')

// Clear all localStorage
localStorage.clear()

console.log('✅ All localStorage cleared!')
console.log('👉 Now reload the page or restart the dev server')
