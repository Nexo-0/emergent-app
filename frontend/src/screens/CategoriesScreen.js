import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Home, ShoppingCart } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CategoriesScreen = () => {
  const navigate = useNavigate();
  const { getCartCount, updateActivity } = useCart();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
      <header className="bg-white shadow-md p-6 flex justify-between items-center">
        <Button
          data-testid="home-button"
          onClick={() => navigate('/')}
          variant="outline"
          className="text-2xl py-8 px-10 font-semibold"
          style={{ minHeight: '80px', minWidth: '150px' }}
        >
          <Home className="mr-3 h-8 w-8" />
          Home
        </Button>
        
        <h1 className="text-5xl font-bold text-gray-800">Select Category</h1>
        
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

      {/* Categories Grid */}
      <main className="container mx-auto p-8">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-4xl text-gray-500">Loading categories...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <button
                key={category.id}
                data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleCategoryClick(category.id)}
                className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500"
                style={{ minHeight: '320px' }}
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 bg-gradient-to-t from-gray-50">
                  <h2 className="text-4xl font-bold text-gray-800 mb-2">{category.name}</h2>
                  <p className="text-2xl text-gray-600">{category.description}</p>
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
