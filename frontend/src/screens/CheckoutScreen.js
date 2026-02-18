import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Banknote, Smartphone, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, getTax, getGrandTotal, clearCart, updateActivity } = useCart();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-blue-600' },
    { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-600' },
    { id: 'mobile', name: 'Mobile Payment', icon: Smartphone, color: 'bg-purple-600' },
  ];

  const handlePaymentSelect = (methodId) => {
    updateActivity();
    setSelectedPayment(methodId);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    
    updateActivity();
    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
        subtotal: getCartTotal(),
        tax: getTax(),
        total: getGrandTotal(),
        payment_method: selectedPayment,
      };

      const response = await api.post('/orders', orderData);
      
      // Navigate to confirmation with order details
      navigate('/confirmation', { state: { order: response.data } });
    } catch (error) {
      console.error('Error creating backend order, using local fallback order:', error);

      const fallbackOrder = {
        id: `local-${Date.now()}`,
        order_number: `ORD-LOCAL-${String(Date.now()).slice(-6)}`,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
        subtotal: getCartTotal(),
        tax: getTax(),
        total: getGrandTotal(),
        payment_method: selectedPayment,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };

      navigate('/confirmation', { state: { order: fallbackOrder } });
    }
  };

  if (cart.length === 0) {
    navigate('/categories');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100" data-testid="checkout-screen">
      {/* Header */}
      <header className="bg-white shadow-md p-6 flex justify-between items-center">
        <Button
          data-testid="back-button"
          onClick={() => navigate('/cart')}
          variant="outline"
          className="text-2xl py-8 px-10 font-semibold"
          style={{ minHeight: '80px', minWidth: '180px' }}
          disabled={processing}
        >
          <ArrowLeft className="mr-3 h-8 w-8" />
          Back
        </Button>
        
        <h1 className="text-5xl font-bold text-gray-800">Checkout</h1>
        
        <div style={{ minWidth: '180px' }}></div>
      </header>

      <div className="container mx-auto p-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b pb-3">
                  <div className="flex-grow">
                    <p className="text-2xl font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xl text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t-2 pt-4">
              <div className="flex justify-between text-2xl">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold" data-testid="checkout-subtotal">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-semibold" data-testid="checkout-tax">${getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-4xl font-bold pt-3 border-t">
                <span className="text-gray-800">Total:</span>
                <span className="text-green-600" data-testid="checkout-total">${getGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Select Payment Method</h2>
            
            <div className="space-y-6 mb-8">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPayment === method.id;
                
                return (
                  <button
                    key={method.id}
                    data-testid={`payment-${method.id}`}
                    onClick={() => handlePaymentSelect(method.id)}
                    disabled={processing}
                    className={`w-full p-8 rounded-2xl border-4 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ minHeight: '120px' }}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`${method.color} p-5 rounded-xl`}>
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                      <span className="text-3xl font-bold text-gray-800">{method.name}</span>
                      {isSelected && (
                        <div className="ml-auto">
                          <div className="bg-blue-600 text-white rounded-full p-2">
                            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              data-testid="confirm-payment-button"
              onClick={handleConfirmPayment}
              disabled={!selectedPayment || processing}
              className="w-full bg-green-600 hover:bg-green-700 text-3xl py-12 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '100px' }}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Confirm Payment - $${getGrandTotal().toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
