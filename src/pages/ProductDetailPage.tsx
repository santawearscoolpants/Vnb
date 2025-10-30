import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../context/RouterContext';
import { ArrowLeft, Heart, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import logo from 'figma:asset/a4eabd48a91cf2ad3f1c96be6aa7cc8c409fc025.png';

const productData: Record<string, any> = {
  '1': {
    name: 'Artisan Leather Sandals',
    price: '$425.00',
    images: [
      'https://images.unsplash.com/photo-1708962000105-849e984e69a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwc2FuZGFscyUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NjE2OTY0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1558376518-2aca96941974?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYW5kYWwlMjBkZXRhaWxlZCUyMHZpZXd8ZW58MXx8fHwxNzYxNjk3NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1662132090867-57a37fa1edf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNhbmRhbHMlMjBzaWRlJTIwdmlld3xlbnwxfHx8fDE3NjE2OTc3NzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    colors: [
      { name: 'Étoupe', value: '#8B7355' },
      { name: 'Black', value: '#1a1a1a' },
      { name: 'Gold', value: '#D4AF37' },
      { name: 'Navy', value: '#1e3a5f' },
      { name: 'Burgundy', value: '#800020' }
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    description: 'Techno-sandal in suede goatskin with anatomical rubber sole and adjustable strap. A sleek design for a comfortable and casual look.',
    details: [
      'Made in Italy',
      'Sole height: 0.5"',
      'Adjustable leather strap',
      'Anatomical footbed'
    ],
    story: 'The Artisan sandal makes life lighter. Inspired by the island that is home to timeless craftsmanship, it exudes authentic and timeless style. The flexible, durable and adjustable strap is combined with an anatomic rubber sole for ultimate comfort. Contemporary and elegant, it embodies all the spirit of the Maison through its H cut.',
    relatedProducts: [
      {
        id: '101',
        name: 'Terre d\'Hermès Eau de parfum intense',
        price: '$157',
        image: 'https://images.unsplash.com/photo-1761659760494-32b921a2449f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlfGVufDF8fHx8MTc2MTY3NDc5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: '102',
        name: 'Reversible leather belt',
        price: '$1,450',
        image: 'https://images.unsplash.com/photo-1734383524180-3c6f9b21e8e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwYmVsdCUyMGxlYXRoZXJ8ZW58MXx8fHwxNzYxNjk3NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      }
    ]
  },
  '2': {
    name: 'Classic Woven Sandals',
    price: '$385.00',
    images: [
      'https://images.unsplash.com/photo-1670495045221-f7218ee3e3b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzaG9lcyUyMHByb2R1Y3QlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjE2OTY0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    colors: [
      { name: 'Tan', value: '#D2B48C' },
      { name: 'Black', value: '#1a1a1a' },
      { name: 'White', value: '#f5f5f5' }
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    description: 'Handwoven leather sandal with premium craftsmanship and timeless design.',
    details: [
      'Made in Italy',
      'Handwoven leather straps',
      'Cushioned insole',
      'Durable rubber outsole'
    ],
    story: 'Crafted with meticulous attention to detail, these woven sandals represent the pinnacle of artisanal shoemaking.',
    relatedProducts: []
  },
  '3': {
    name: 'Premium Slide Sandals',
    price: '$295.00',
    images: [
      'https://images.unsplash.com/photo-1652869119567-c1acee6e6d33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNhbmRhbHMlMjBzdHVkaW98ZW58MXx8fHwxNzYxNjk2NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    colors: [
      { name: 'Camel', value: '#C19A6B' },
      { name: 'Black', value: '#1a1a1a' }
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    description: 'Effortless luxury with premium leather slide construction.',
    details: [
      'Made in Spain',
      'Full-grain leather',
      'Leather lining',
      'Slip-resistant sole'
    ],
    story: 'Designed for the modern individual who values both comfort and style in equal measure.',
    relatedProducts: []
  },
  '4': {
    name: 'Handcrafted Strappy Sandals',
    price: '$465.00',
    images: [
      'https://images.unsplash.com/photo-1576318683154-ec6acd0dbcb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZm9vdHdlYXIlMjBjbGVhbiUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzYxNjk2NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    colors: [
      { name: 'Brown', value: '#8B4513' },
      { name: 'Black', value: '#1a1a1a' },
      { name: 'Cognac', value: '#A0522D' }
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    description: 'Intricate strappy design with superior comfort and artisanal quality.',
    details: [
      'Made in Italy',
      'Multiple adjustable straps',
      'Padded footbed',
      'Premium leather construction'
    ],
    story: 'Each pair is meticulously handcrafted by skilled artisans, ensuring exceptional quality and unique character.',
    relatedProducts: []
  }
};

export function ProductDetailPage() {
  const { goBack, productId } = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const product = productData[productId || '1'];

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    toast.success('Added to cart successfully!');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="border-b border-zinc-200 px-4 py-4 md:px-8">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square overflow-hidden bg-zinc-100"
            >
              <ImageWithFallback
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </motion.div>

            {/* Thumbnail Images */}
            <div className="flex gap-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 w-20 overflow-hidden bg-zinc-100 ${
                    selectedImage === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="mb-2">{product.name}</h1>
              <p className="text-sm text-zinc-600">{product.price}</p>
            </div>

            {/* Color Selection */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm">Color</p>
                <p className="text-sm text-zinc-600">{product.colors[selectedColor].name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`h-12 w-12 overflow-hidden bg-zinc-100 transition-all ${
                      selectedColor === index ? 'ring-2 ring-black ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <p className="mb-4 text-sm">Size</p>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border py-3 text-sm transition-colors ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-zinc-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <button
              className="flex w-full items-center justify-center gap-2 bg-black px-8 py-4 text-sm text-white transition-opacity hover:opacity-80"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              ADD TO CART
            </button>

            {/* Apple Pay */}
            <button className="w-full border border-black px-8 py-4 text-sm transition-colors hover:bg-black hover:text-white">
              <span className="text-sm">Apple Pay</span>
            </button>

            {/* Product Description */}
            <div className="border-t border-zinc-200 pt-8">
              <p className="text-sm leading-relaxed text-zinc-700">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              {product.details.map((detail: string, index: number) => (
                <p key={index} className="text-xs text-zinc-600">
                  {detail}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* The Story Behind */}
        {product.story && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 border-t border-zinc-200 pt-16"
          >
            <h2 className="mb-8 text-center">THE STORY BEHIND</h2>
            <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-zinc-700">
              {product.story}
            </p>
          </motion.div>
        )}

        {/* The Perfect Partner */}
        {product.relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24"
          >
            <h2 className="mb-12 text-center">THE PERFECT PARTNER</h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {product.relatedProducts.map((item: any) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="mb-4 aspect-square overflow-hidden bg-zinc-100">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="mb-1 text-sm">{item.name}</h4>
                  <p className="text-xs text-zinc-600">{item.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}