import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { clearCart, updateActivity } = useCart();

  useEffect(() => {
    // Clear cart when returning to welcome screen
    clearCart();
  }, []);

  const handleStart = () => {
    updateActivity();
    navigate('/categories');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center p-8" data-testid="welcome-screen">
      <div className="text-center space-y-12 max-w-4xl">
        {/* Logo/Brand */}
        <div className="space-y-6">
          <div className="text-8xl mb-8" role="img" aria-label="Shopping">
            🛒
          </div>
          <h1 className="text-7xl font-bold text-white drop-shadow-2xl" data-testid="welcome-title">
            Welcome to QuickShop
          </h1>
          <p className="text-3xl text-white/90 font-medium">
            Your Self-Service Shopping Experience
          </p>
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center space-y-8">
          <Button
            data-testid="start-order-button"
            onClick={handleStart}
            className="bg-white text-blue-600 hover:bg-blue-50 text-4xl font-bold py-12 px-24 rounded-3xl shadow-2xl transform transition-all hover:scale-105 active:scale-95"
            style={{ minHeight: '120px', minWidth: '400px' }}
          >
            Start Shopping
          </Button>

          {/* Language Options */}
          <div className="flex gap-6 mt-8">
            <button className="text-white/80 hover:text-white text-2xl font-medium underline transition-colors">
              English
            </button>
            <span className="text-white/60 text-2xl">|</span>
            <button className="text-white/80 hover:text-white text-2xl font-medium underline transition-colors">
              Español
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-white/70 text-2xl space-y-3">
          <p>👆 Touch the screen to begin</p>
          <p>🛍️ Browse products and build your order</p>
          <p>💳 Complete your purchase quickly and easily</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
