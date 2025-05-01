// pages/index.tsx
import { useRouter } from 'next/router'

const Home = () => {
  const router = useRouter()

  const handleNavigateToSignIn = () => {
    router.push('/signin') // Navigate to the SignIn page
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome to Chat App</h1>
        <p className="mb-4">Start chatting with your friends now!</p>
        <button
          onClick={handleNavigateToSignIn}
          className="w-full p-2 bg-blue-600 text-white rounded-lg"
        >
          Sign In / Sign Up
        </button>
      </div>
    </div>
  )
}

export default Home
