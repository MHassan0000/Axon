import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";

export default function Home() {
  return (
    <main className="relative w-full flex flex-col gap-20">
      <Navbar />
      <Hero />
    </main>
  );
}
