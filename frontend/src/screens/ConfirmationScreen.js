import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer, Home } from 'lucide-react';

const ConfirmationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [countdown, setCountdown] = useState(30);
  const order = location.state?.order;

  useEffect(() => {
    // Clear cart on mount
    clearCart();

    // Countdown timer to auto-return to home
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNewOrder = () => {
    navigate('/');
  };

  const handlePrint = () => {
    alert('Receipt printing...');
  };

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-8" data-testid="confirmation-screen">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="h-32 w-32 text-green-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-4">Order Complete!</h1>
          <p className="text-3xl text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-2xl text-gray-600 mb-2">Order Number</p>
            <p className="text-5xl font-bold text-blue-600" data-testid="order-number">{order.order_number}</p>
          </div>

          <div className="border-t-2 border-gray-200 pt-6 space-y-4">
            {/* Items List */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Items:</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-xl text-gray-700">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="font-semibold">${item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-2xl">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold" data-testid="confirmation-subtotal">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold" data-testid="confirmation-tax">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-3xl font-bold pt-3 border-t-2 border-gray-400">
                <span className="text-gray-800">Total Paid:</span>
                <span className="text-green-600" data-testid="confirmation-total">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border-t border-gray-300 pt-4">
              <p className="text-2xl text-gray-600">
                Payment Method: <span className="font-semibold text-gray-800 capitalize">{order.payment_method}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            data-testid="print-receipt-button"
            onClick={handlePrint}
            variant="outline"
            className="w-full text-3xl py-10 font-semibold"
            style={{ minHeight: '90px' }}
          >
            <Printer className="mr-3 h-8 w-8" />
            Print Receipt
          </Button>
          
          <Button
            data-testid="new-order-button"
            onClick={handleNewOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-3xl py-10 font-bold"
            style={{ minHeight: '90px' }}
          >
            <Home className="mr-3 h-8 w-8" />
            Start New Order
          </Button>
        </div>

        {/* Auto-return countdown */}
        <div className="text-center mt-8">
          <p className="text-2xl text-gray-500">
            Returning to home in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
