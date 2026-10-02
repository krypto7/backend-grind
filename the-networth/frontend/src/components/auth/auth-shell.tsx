import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/auth/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[minmax(320px,5fr)_minmax(0,6fr)]">
      <BrandPanel />
      <main className="flex min-h-svh flex-col">
        <header className="flex items-center px-5 py-4 sm:px-8 lg:hidden">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="w-full max-w-[26rem]">{children}</div>
        </div>
      </main>
    </div>
  );
}
