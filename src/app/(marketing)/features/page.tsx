import FeatureHero from "@/components/features/features/FeatureHero";
import FeatureList from "@/components/features/features/FeatureList";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
// import FeaturesSection from "@/components/features/features/FeatureSection";

export default function FiturPage() {
  return (
    <main className="bg-white">
        <Navbar/>
      <FeatureHero />
      <FeatureList />
      <CTA />
      {/* <FeaturesSection/> */}
      <Footer/>
    </main>
  );
}