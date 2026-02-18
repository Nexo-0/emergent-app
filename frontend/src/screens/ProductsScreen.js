import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const ProductsScreen = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartCount, updateActivity } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products', { params: { category_id: categoryId } }),
        api.get('/categories')
      ]);
      setProducts(productsRes.data);
      const category = categoriesRes.data.find(c => c.id === categoryId);
      setCategoryName(category?.name || '');
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setCategoryName('');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    updateActivity();
    addToCart(product, 1);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
      duration: 2000,
    });
  };

  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-gray-100" data-testid="products-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Button
            data-testid="back-button"
            onClick={() => navigate('/categories')}
            variant="outline"
            className="text-base py-2.5 px-4 font-semibold"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate" data-testid="category-title">
            {categoryName}
          </h1>

          <Button
            data-testid="cart-button"
            onClick={() => navigate('/cart')}
            className="bg-blue-600 hover:bg-blue-700 text-base py-2.5 px-4 font-semibold relative"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
                data-testid="cart-count"
              >
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-lg text-gray-500">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-56 space-y-3">
            <div className="text-lg text-gray-500">No products available</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                data-testid={`product-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="h-[200px] max-h-[200px] overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 leading-5 h-10 overflow-hidden mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600" data-testid={`price-${product.id}`}>
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      data-testid={`add-to-cart-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-sm py-2 px-4 font-semibold"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsScreen;
