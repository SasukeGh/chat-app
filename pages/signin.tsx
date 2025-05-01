// pages/signin.tsx
import { useState } from 'react'
import supabase from '../lib/supabaseClient'
import { useRouter } from 'next/router'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false) // For toggling between Sign In and Sign Up
  const router = useRouter()

  const handleSignInOrSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    let response
    if (isSignUp) {
      // Sign Up
      response = await supabase.auth.signUp({
        email,
        password,
      })
    } else {
      // Sign In
      response = await supabase.auth.signInWithPassword({
        email,
        password,
      })
    }

    const { data, error } = response

    if (error) {
      setError(error.message)
    } else {
      // If successful, redirect to the chat page
      router.push('/chat')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSignInOrSignUp}>
          <input
            type="email"
            className="w-full p-2 mb-4 border rounded-lg"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-2 mb-4 border rounded-lg"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded-lg"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignIn
