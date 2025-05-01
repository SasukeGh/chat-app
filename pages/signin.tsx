// pages/signin.tsx
import { useState } from 'react'
import supabase from '../lib/supabaseClient'
import { useRouter } from 'next/router'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // If sign-in is successful, redirect to the chat page
      router.push('/chat')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Sign In</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSignIn}>
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
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignIn
