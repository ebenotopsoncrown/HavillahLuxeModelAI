import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Crown, ArrowLeft } from 'lucide-react'

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#C6A052]/10 flex items-center justify-center mx-auto mb-6">
          <Crown size={36} className="text-[#C6A052]/50" />
        </div>
        <h1 className="text-6xl font-bold text-[#C6A052] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>404</h1>
        <p className="text-xl text-[#F8F5F0]/70 mb-2">Page Not Found</p>
        <p className="text-sm text-[#F8F5F0]/40 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard">
          <Button>
            <ArrowLeft size={15} /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
