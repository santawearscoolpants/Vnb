import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../context/RouterContext';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .replace('/api', '');

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
}

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  in_stock: boolean;
  stock_quantity: number;
  images: { id: number; image: string; alt_text: string; is_primary: boolean; order: number }[];
  colors: { id: number; name: string; hex_code: string; is_available: boolean }[];
  sizes: { id: number; size: string; is_available: boolean }[];
  details: { id: number; detail: string; order: number }[];
}

export function ProductDetailPage() {
  const { goBack, productId } = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('No product specified.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSelectedImage(0);
    setSelectedColor(0);
    setSelectedSize(null);

    api.getProduct(productId)
      .then((data) => setProduct(data as ApiProduct))
      .catch(() => setError('Product not found or unavailable.'))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const colorName = product.colors[selectedColor]?.name || '';
    addItem(product.id, 1, selectedSize, colorName)
      .then(() => toast.success('Added to cart successfully!'))
      .catch(() => toast.error('Failed to add to cart'));
  };

  // All image URLs for the gallery: prefer the images[] array, fallback to main image
  const imageUrls: string[] = product
    ? product.images.length > 0
      ? product.images.map((img) => resolveImageUrl(img.image))
      : [resolveImageUrl(product.image)]
    : [];

  const availableSizes = product?.sizes.filter((s) => s.is_available) ?? [];
  const availableColors = product?.colors.filter((c) => c.is_available) ?? [];

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

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-sm bg-zinc-100" />
            <div className="space-y-6">
              <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-100" />
              <div className="h-5 w-1/4 animate-pulse rounded bg-zinc-100" />
              <div className="h-32 animate-pulse rounded bg-zinc-100" />
              <div className="h-12 animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="mx-auto max-w-7xl px-4 py-32 text-center md:px-8">
          <p className="mb-6 text-sm text-zinc-600">{error}</p>
          <button
            onClick={goBack}
            className="text-sm underline hover:text-zinc-600"
          >
            Go back
          </button>
        </div>
      )}

      {/* Product content */}
      {!isLoading && product && (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left: Images */}
            <div className="space-y-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square overflow-hidden bg-zinc-100"
              >
                <ImageWithFallback
                  src={imageUrls[selectedImage] || ''}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </motion.div>

              {imageUrls.length > 1 && (
                <div className="flex gap-2">
                  {imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 w-20 overflow-hidden bg-zinc-100 ${
                        selectedImage === index ? 'ring-2 ring-black' : ''
                      }`}
                    >
                      <ImageWithFallback
                        src={url}
                        alt={`${product.name} view ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="mb-2">{product.name}</h1>
                <p className="text-sm text-zinc-600">
                  ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                {!product.in_stock && (
                  <p className="mt-1 text-xs text-red-600">Out of stock</p>
                )}
              </div>

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm">Color</p>
                    <p className="text-sm text-zinc-600">{availableColors[selectedColor]?.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color, index) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(index)}
                        className={`h-12 w-12 transition-all ${
                          selectedColor === index ? 'ring-2 ring-black ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: color.hex_code }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <p className="mb-4 text-sm">Size</p>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s.size)}
                        className={`border py-3 text-sm transition-colors ${
                          selectedSize === s.size
                            ? 'border-black bg-black text-white'
                            : 'border-zinc-300 hover:border-black'
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                disabled={!product.in_stock}
                className="flex w-full items-center justify-center gap-2 bg-black px-8 py-4 text-sm text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:bg-zinc-400"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
                {product.in_stock ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>

              {/* Apple Pay */}
              <button className="w-full border border-black px-8 py-4 text-sm transition-colors hover:bg-black hover:text-white">
                Apple Pay
              </button>

              {/* Description */}
              <div className="border-t border-zinc-200 pt-8">
                <p className="text-sm leading-relaxed text-zinc-700">{product.description}</p>
              </div>

              {/* Details */}
              {product.details.length > 0 && (
                <div className="space-y-2">
                  {product.details.map((d) => (
                    <p key={d.id} className="text-xs text-zinc-600">{d.detail}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
