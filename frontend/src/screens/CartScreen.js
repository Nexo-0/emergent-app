import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartScreen = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, getTax, getGrandTotal, getCartCount, updateActivity } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    updateActivity();
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productId) => {
    updateActivity();
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    updateActivity();
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100" data-testid="cart-screen">
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
          
          <h1 className="text-5xl font-bold text-gray-800">Shopping Cart</h1>
          
          <div style={{ minWidth: '180px' }}></div>
        </header>

        {/* Empty Cart */}
        <div className="flex flex-col items-center justify-center h-96 space-y-8">
          <ShoppingBag className="h-32 w-32 text-gray-300" />
          <h2 className="text-4xl font-bold text-gray-500">Your cart is empty</h2>
          <p className="text-2xl text-gray-400">Add items to get started</p>
          <Button
            data-testid="continue-shopping-button"
            onClick={() => navigate('/categories')}
            className="bg-blue-600 hover:bg-blue-700 text-2xl py-8 px-12 font-semibold"
            style={{ minHeight: '80px' }}
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" data-testid="cart-screen">
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
        
        <h1 className="text-5xl font-bold text-gray-800">Shopping Cart</h1>
        
        <div className="text-2xl font-semibold text-gray-600" data-testid="item-count">
          {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'}
        </div>
      </header>

      <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              data-testid={`cart-item-${item.id}`}
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6"
            >
              {/* Product Image */}
              <img
                src={item.image_url}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-xl"
              />

              {/* Product Details */}
              <div className="flex-grow">
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-xl text-gray-600 mb-3">{item.description}</p>
                <p className="text-2xl font-bold text-green-600">${item.price.toFixed(2)} each</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4">
                <Button
                  data-testid={`decrease-quantity-${item.id}`}
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  variant="outline"
                  className="text-2xl py-6 px-6"
                  style={{ minHeight: '70px', minWidth: '70px' }}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                
                <span className="text-3xl font-bold w-20 text-center" data-testid={`quantity-${item.id}`}>
                  {item.quantity}
                </span>
                
                <Button
                  data-testid={`increase-quantity-${item.id}`}
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  variant="outline"
                  className="text-2xl py-6 px-6"
                  style={{ minHeight: '70px', minWidth: '70px' }}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800" data-testid={`item-total-${item.id}`}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                data-testid={`remove-item-${item.id}`}
                onClick={() => handleRemove(item.id)}
                variant="destructive"
                className="text-xl py-6 px-6"
                style={{ minHeight: '70px', minWidth: '70px' }}
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-2xl">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold" data-testid="subtotal">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-semibold" data-testid="tax">${getTax().toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-4 flex justify-between text-3xl">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-green-600" data-testid="grand-total">${getGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                data-testid="checkout-button"
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-3xl py-10 font-bold"
                style={{ minHeight: '90px' }}
              >
                Proceed to Checkout
              </Button>
              
              <Button
                data-testid="continue-shopping-button"
                onClick={() => navigate('/categories')}
                variant="outline"
                className="w-full text-2xl py-8 font-semibold"
                style={{ minHeight: '80px' }}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
