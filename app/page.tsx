import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { FileText, Sparkles, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--macos-bg)]">
      {/* Header with user button */}
      <header className="flex justify-end items-center p-6 gap-4">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      {/* Hero Section */}
      <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            老张的备忘录
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-center text-[var(--macos-text-secondary)] mb-12 max-w-xl mx-auto">
            简洁、优雅的个人笔记应用，让记录变得轻松愉快
          </p>

          {/* Buttons */}
          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/sign-in"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                登录
              </Link>
              <Link
                href="/sign-up"
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                免费注册
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 justify-center"
            >
              <Zap className="w-5 h-5" />
              进入备忘录
            </Link>
          </SignedIn>
          </div>
      </main>
    </div>
  );
}
