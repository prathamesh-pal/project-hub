import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import Contexts from './components/Contexts';
import TrueProfile from './components/TrueProfile';
import Claim from './components/Claim';
import Latest from './components/Latest';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function App() {
  // One observer drives every reveal (line masks, drawn rules).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }),
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a className="skip" href="#manifesto">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Contexts />
        <TrueProfile />
        <Claim />
        <Latest />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
