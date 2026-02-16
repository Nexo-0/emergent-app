import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
        axios.get(`${API}/products?category_id=${categoryId}`),
        axios.get(`${API}/categories`)
      ]);
      setProducts(productsRes.data);
      const category = categoriesRes.data.find(c => c.id === categoryId);
      setCategoryName(category?.name || '');
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    updateActivity();
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 2000,
    });
  };

  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-gray-100" data-testid="products-screen">
      {/* Header */}
      <header className="bg-white shadow-md p-6 flex justify-between items-center">
        <Button
          data-testid="back-button"
          onClick={() => navigate('/categories')}
          variant="outline"
          className="text-2xl py-8 px-10 font-semibold"
          style={{ minHeight: '80px', minWidth: '180px' }}
        >
          <ArrowLeft className="mr-3 h-8 w-8" />
          Back
        </Button>
        
        <h1 className="text-5xl font-bold text-gray-800" data-testid="category-title">{categoryName}</h1>
        
        <Button
          data-testid="cart-button"
          onClick={() => navigate('/cart')}
          className="bg-blue-600 hover:bg-blue-700 text-2xl py-8 px-10 font-semibold relative"
          style={{ minHeight: '80px', minWidth: '150px' }}
        >
          <ShoppingCart className="mr-3 h-8 w-8" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center" data-testid="cart-count">
              {cartCount}
            </span>
          )}
        </Button>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto p-8">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-4xl text-gray-500">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96 space-y-6">
            <div className="text-5xl text-gray-400">📦</div>
            <div className="text-4xl text-gray-500">No products available</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                data-testid={`product-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="h-56 overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-lg text-gray-600 mb-4 flex-grow">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold text-green-600" data-testid={`price-${product.id}`}>
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      data-testid={`add-to-cart-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-xl py-6 px-8 font-semibold"
                      style={{ minHeight: '60px' }}
                    >
                      <Plus className="mr-2 h-6 w-6" />
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
