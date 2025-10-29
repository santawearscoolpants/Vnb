import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { ProductCategories } from './components/ProductCategories';
import { SandalsSection } from './components/SandalsSection';
import { FeaturedCollection } from './components/FeaturedCollection';
import { BrandStory } from './components/BrandStory';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <ProductCategories />
      <SandalsSection />
      <FeaturedCollection />
      <BrandStory />
      <Newsletter />
      <Footer />
    </div>
  );
}
