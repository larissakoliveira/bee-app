import React, { useCallback, useEffect, useState } from 'react';
import { fetchProducts, registerEmailContentful } from '../../services/contentfulService';
import { Product } from '../../services/types';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import { useBeeMovement } from '../../hooks/useBeeMovement';
import { getLocalizedProductCopy } from '../../constants/productLanguage';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const bees = useBeeMovement();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        if (!cancelled) {
          setProducts(fetchedProducts);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNotify = useCallback(async (email: string, productId: string) => {
    await registerEmailContentful(email, productId, currentLanguage);
  }, [currentLanguage]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4" aria-busy="true" aria-label={t('loading')}>
        <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[465px] max-w-xs w-full mx-auto rounded-lg bg-white/60 shadow-md animate-pulse"
            >
              <div className="h-8 bg-custom-brown/20 rounded mx-8 mt-4" />
              <div className="h-64 bg-custom-brown/10 rounded-md m-4" />
              <div className="h-4 bg-custom-brown/15 rounded mx-12" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
        {products.map((product, index) => {
          const { name: productName, description: productDescription } = getLocalizedProductCopy(
            product,
            currentLanguage
          );

          return (
            <Card
              key={product.id}
              productId={product.id}
              productName={productName}
              productImage={product.image.url}
              description={productDescription || t('noDescription')}
              isInStock={product.isInStock}
              onNotify={handleNotify}
              imageFetchPriority={index === 0 ? 'high' : 'low'}
            />
          );
        })}
      </div>

      {bees.map((bee, index) => (
        <img
          key={index}
          src="/bee.png"
          alt=""
          width={20}
          height={20}
          decoding="async"
          className="pointer-events-none fixed z-[1000] w-5 h-5 -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-100 ease-out motion-reduce:transition-none"
          style={{
            left: `${bee.x}px`,
            top: `${bee.y}px`,
          }}
        />
      ))}
    </main>
  );
};

export default HomePage;
