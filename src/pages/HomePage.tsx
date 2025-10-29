import { Hero } from '../components/Hero';
import { ProductCategories } from '../components/ProductCategories';
import { SandalsSection } from '../components/SandalsSection';
import { FeaturedCollection } from '../components/FeaturedCollection';
import { BrandStory } from '../components/BrandStory';
import { Newsletter } from '../components/Newsletter';

export function HomePage() {
  return (
    <>
      <Hero />
      <ProductCategories />
      <SandalsSection />
      <FeaturedCollection />
      <BrandStory />
      <Newsletter />
    </>
  );
}
