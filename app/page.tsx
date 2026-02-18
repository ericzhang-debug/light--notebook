import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--macos-bg)]">
      {/* Header with user button */}
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="max-w-2xl px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-[var(--macos-text-primary)] mb-4">
            老张的备忘录
          </h1>
          <p className="text-lg text-[var(--macos-text-secondary)] mb-8">
            简洁、优雅的个人笔记应用
          </p>

          <SignedOut>
            <div className="flex gap-4 justify-center">
              <Link
                href="/sign-in"
                className="px-6 py-3 bg-[var(--macos-sidebar-selected)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                登录
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-3 border border-[var(--macos-border)] rounded-lg font-medium hover:bg-[var(--macos-sidebar-hover)] transition-colors"
              >
                注册
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-[var(--macos-sidebar-selected)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              进入备忘录
            </Link>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
