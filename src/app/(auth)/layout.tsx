import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-border py-5">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <Link href="/" className="flex flex-col items-center">
            <span className="font-serif text-2xl font-bold tracking-[0.3em] text-white uppercase">SAID</span>
            <span className="text-[9px] tracking-[0.5em] text-gold uppercase">Perfumes</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
