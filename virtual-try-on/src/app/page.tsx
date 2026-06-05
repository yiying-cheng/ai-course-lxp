import { SiteHeader } from '@/components/layout/site-header';
import { TryOnStudio } from '@/components/try-on/try-on-studio';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-6 py-12 md:py-16">
        <TryOnStudio />
      </main>
      <footer className="py-8 text-center text-[12px] text-[#86868b]">
        Preview for purchase reference only · Not a fit or size guarantee
      </footer>
    </>
  );
}
