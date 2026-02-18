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
    clearCart();

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
    window.print();
  };

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6" data-testid="confirmation-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="no-print text-center mb-6">
          <div className="inline-block p-5 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-20 w-20 text-green-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">Order Complete!</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase</p>
        </div>

        <section id="receipt" className="receipt bg-gray-50 rounded-2xl p-6 max-w-2xl mx-auto mb-6">
          <div className="text-center mb-5">
            <p className="text-base text-gray-600 mb-1">Order Number</p>
            <p className="text-3xl font-bold text-blue-600" data-testid="order-number">{order.order_number}</p>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm sm:text-base text-gray-700">
                    <span>{item.product_name} x {item.quantity}</span>
                    <span className="font-semibold">${item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-300 pt-3 space-y-2">
              <div className="flex justify-between text-base sm:text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold" data-testid="confirmation-subtotal">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold" data-testid="confirmation-tax">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-400">
                <span className="text-gray-800">Total Paid:</span>
                <span className="text-green-600" data-testid="confirmation-total">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-3">
              <p className="text-sm sm:text-base text-gray-600">
                Payment Method: <span className="font-semibold text-gray-800 capitalize">{order.payment_method}</span>
              </p>
            </div>
          </div>
        </section>

        <div className="no-print space-y-3">
          <Button
            data-testid="print-receipt-button"
            onClick={handlePrint}
            variant="outline"
            className="w-full text-lg py-4 font-semibold"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print Receipt
          </Button>

          <Button
            data-testid="new-order-button"
            onClick={handleNewOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4 font-bold"
          >
            <Home className="mr-2 h-5 w-5" />
            Start New Order
          </Button>
        </div>

        <div className="no-print text-center mt-6">
          <p className="text-base text-gray-500">
            Returning to home in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
