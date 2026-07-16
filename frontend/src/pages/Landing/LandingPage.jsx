import Navbar from "../../components/Landing/Navbar/Navbar";
import Hero from "../../components/Landing/Hero/Hero";
import Features from "../../components/Landing/Features/Features";
import About from "../../components/Landing/About/About";
import FAQ from "../../components/Landing/FAQ/FAQ";
import Contact from "../../components/Landing/Contact/Contact";
import Footer from "../../components/Landing/Footer/Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />

      {/* Fixed Navbar Spacer */}
      <div className="pt-24">

        <Hero />

        <Features />

        <About />

        <FAQ />

        <Contact />

        <Footer />

      </div>
    </>
  );
};

export default LandingPage;