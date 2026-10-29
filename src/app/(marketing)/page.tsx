// app/(landing)/page.tsx

import CTA from "@/components/landing/CTA";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Steps from "@/components/landing/Steps";
import Trusted from "@/components/landing/Trusted";

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero/>
      <Trusted/>
      <Features/>
      <Steps/>
      <CTA/>
      <Footer/>

      <div className="max-h-full flex items-center justify-center">
      </div>
    </>
  );
}


// import Hero from "@/components/Layout/Hero";
// import Features from "@/components/Layout/Features";
// import Footer from "@/components/Layout/Footer";

// export default function HomePage() {
//   return (
//     <div>
//       <section className="flex-1 overflow-y-auto">
//         <Hero />
//         <Features />
//         <Footer />
//       </section>
//     </div>
//   );
// }
