import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen max-w-4xl mx-auto px-4 py-12">{children}</main>
      <Footer />
    </>
  );
}
