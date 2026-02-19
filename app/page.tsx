import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { FileText, Sparkles, Shield } from 'lucide-react';

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect('/dashboard');
  }

  // 未登录用户显示的内容
  return (
    <div className="min-h-screen bg-[var(--macos-bg)]">
      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/sign-in"
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              登录
            </a>
            <a
              href="/sign-up"
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              免费注册
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
