import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../context/RouterContext';
import { ArrowLeft, ShoppingBag, Ruler, X, ZoomIn, Zap } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { resolveMediaUrl } from '../utils/media';

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
  const { goBack, productId, navigateTo } = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

  const closeZoomOnEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsImageZoomOpen(false);
  }, []);
  useEffect(() => {
    if (isImageZoomOpen) window.addEventListener('keydown', closeZoomOnEscape);
    return () => window.removeEventListener('keydown', closeZoomOnEscape);
  }, [isImageZoomOpen, closeZoomOnEscape]);

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

  const [buyNowLoading, setBuyNowLoading] = useState(false);

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

  const handleBuyNow = async () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    setBuyNowLoading(true);
    const colorName = product.colors[selectedColor]?.name || '';
    try {
      await addItem(product.id, 1, selectedSize, colorName);
      navigateTo('checkout');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setBuyNowLoading(false);
    }
  };

  // All image URLs for the gallery: prefer the images[] array, fallback to main image
  const imageUrls: string[] = product
    ? product.images.length > 0
      ? product.images.map((img) => resolveMediaUrl(img.image))
      : [resolveMediaUrl(product.image)]
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
              <motion.button
                type="button"
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group relative aspect-square w-full overflow-hidden bg-zinc-100 text-left"
                onClick={() => setIsImageZoomOpen(true)}
                aria-label="Zoom image"
              >
                <ImageWithFallback
                  src={imageUrls[selectedImage] || ''}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </motion.button>

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
                <p className="text-sm text-zinc-600">{formatPrice(product.price)}</p>
                {/* Stock / availability */}
                {!product.in_stock && (
                  <p className="mt-1 text-sm font-medium text-red-600">Out of stock</p>
                )}
                {product.in_stock && product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                  <p className="mt-1 text-sm text-amber-700">Only {product.stock_quantity} left</p>
                )}
                {product.in_stock && product.stock_quantity > 5 && (
                  <p className="mt-1 text-xs text-zinc-500">In stock</p>
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
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm">Size</p>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center gap-1 text-xs text-zinc-500 underline hover:text-black"
                    >
                      <Ruler className="h-3.5 w-3.5" />
                      Size guide
                    </button>
                  </div>
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

              {/* Buy Now — express checkout */}
              <button
                disabled={!product.in_stock || buyNowLoading}
                onClick={handleBuyNow}
                className="flex w-full items-center justify-center gap-2 border border-black px-8 py-4 text-sm transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400 disabled:hover:bg-transparent"
              >
                <Zap className="h-4 w-4" />
                {buyNowLoading ? 'PROCESSING...' : 'BUY NOW'}
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

          {/* Size guide modal */}
          <AnimatePresence>
            {isSizeGuideOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={() => setIsSizeGuideOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-sm bg-white p-6 shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-black">Size guide</h3>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(false)}
                      className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-black"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mb-4 text-xs text-zinc-500">
                    Measure your feet or body and compare to the table below. If between sizes, we recommend sizing up.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200">
                          <th className="py-2 text-left font-medium text-black">US</th>
                          <th className="py-2 text-left font-medium text-black">UK</th>
                          <th className="py-2 text-left font-medium text-black">EU</th>
                          <th className="py-2 text-left font-medium text-black">Length (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-zinc-600">
                        {[
                          [6, 5, 39, 24], [7, 6, 40, 24.5], [8, 7, 41, 25.5], [9, 8, 42, 26],
                          [10, 9, 43, 27], [11, 10, 44, 28], [12, 11, 45, 29],
                        ].map(([us, uk, eu, cm], i) => (
                          <tr key={i} className="border-b border-zinc-100">
                            <td className="py-2">{us}</td>
                            <td className="py-2">{uk}</td>
                            <td className="py-2">{eu}</td>
                            <td className="py-2">{cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-xs text-zinc-400">
                    Sizes may vary by style. For clothing, refer to the product description or contact us.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image zoom modal */}
          <AnimatePresence>
            {isImageZoomOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                onClick={() => setIsImageZoomOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsImageZoomOpen(false)}
                  className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
                  aria-label="Close zoom"
                >
                  <X className="h-6 w-6" />
                </button>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="relative max-h-[90vh] max-w-[90vw]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ImageWithFallback
                    src={imageUrls[selectedImage] || ''}
                    alt={product.name}
                    className="max-h-[90vh] w-auto max-w-full object-contain"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
