import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pearl flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-violet/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-midnight mb-2">Page Not Found</h1>
        <p className="text-slate mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/auction" className="px-6 py-3 border-2 border-gray-200 text-slate rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Browse Auction
          </Link>
        </div>
      </div>
    </div>
  )
}
