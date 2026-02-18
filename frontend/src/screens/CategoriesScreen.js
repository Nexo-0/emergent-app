import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Home, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';

const CategoriesScreen = () => {
  const navigate = useNavigate();
  const { getCartCount, updateActivity } = useCart();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/categories');
      if (process.env.NODE_ENV === 'development') {
        console.log('Categories API response:', response.data);
      }

      const rawCategories = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.categories)
          ? response.data.categories
          : [];

      const normalizedCategories = rawCategories.map((category) => ({
        ...category,
        id: category.id || category._id,
      }));

      setCategories(normalizedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Unable to load categories. Please try again.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    updateActivity();
    navigate(`/products/${categoryId}`);
  };

  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-gray-100" data-testid="categories-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Button
            data-testid="home-button"
            onClick={() => navigate('/')}
            variant="outline"
            className="text-base py-2.5 px-4 font-semibold"
          >
            <Home className="mr-2 h-5 w-5" />
            Home
          </Button>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Select Category</h1>

          <Button
            data-testid="cart-button"
            onClick={() => navigate('/cart')}
            className="bg-blue-600 hover:bg-blue-700 text-base py-2.5 px-4 font-semibold relative"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center" data-testid="cart-count">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Categories Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-lg text-gray-500">Loading categories...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-40 gap-3">
            <div className="text-base text-red-600">{error}</div>
            <Button onClick={fetchCategories} variant="outline" className="text-sm px-4 py-2">
              Retry
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-lg text-gray-500">No categories found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                data-testid={`category-${String(category.name || '').toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleCategoryClick(category.id)}
                className="bg-white rounded-xl shadow-sm overflow-hidden text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="h-[200px] max-h-[200px] overflow-hidden bg-gray-100">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">{category.name}</h2>
                  <p className="text-sm text-gray-600 leading-5 h-10 overflow-hidden">{category.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoriesScreen;
