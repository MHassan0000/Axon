import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";
import AppWorkflow from "@/components/shared/AppWorkflow";
import HowItWorks from "@/components/shared/HowItWorks";
import CoreFeatures from "@/components/shared/CoreFeatures";
import WhyDifferent from "@/components/shared/WhyDifferent";
import Testimonials from "@/components/shared/Testimonials";
import SignupCTA from "@/components/shared/SignupCTA";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="relative w-full flex flex-col">
      <section className="flex flex-col gap-20">
        <Navbar />
        <Hero />
      </section>
      <AppWorkflow />
      <HowItWorks />
      <CoreFeatures />
      <WhyDifferent />
      <Testimonials />
      <SignupCTA />
      <Footer />
    </main>
  );
}
