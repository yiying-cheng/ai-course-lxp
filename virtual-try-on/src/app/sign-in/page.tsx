import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';

export default function SignInPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="text-[21px] font-semibold tracking-tight text-[#1d1d1f]">
          FitPreview
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <AuthForm mode="sign-in" />
      </main>
    </div>
  );
}
