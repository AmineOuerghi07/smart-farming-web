import React from "react";
import { ArrowLeft, CreditCard } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const ShoppingCart: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 149.99,
      quantity: 2,
      image: "https://via.placeholder.com/64",
    },
    {
      id: 2,
      name: "Bluetooth Speaker",
      price: 89.99,
      quantity: 1,
      image: "https://via.placeholder.com/64",
    },
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: newQuantity } : p))
    );
  };

  const calculateTotal = () => {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  return (
    <div className="flex w-screen min-h-screen bg-gray-800">
      <div className="flex-1 flex justify-center items-start py-10">
        <div className="w-full max-w-4xl px-4">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-6">Shopping Cart</h1>

            {products.length === 0 ? (
              <p className="text-gray-400 mt-4">
                Your cart is currently empty.
              </p>
            ) : (
              <div className="mt-8 space-y-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-900 rounded-2xl p-6 flex items-center shadow-md"
                  >
                    <div className="flex-shrink-0 mr-6">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-white">
                        {product.name}
                      </h2>
                      <p className="text-green-400 text-lg mt-1">
                        {product.price.toFixed(2)} DT
                      </p>
                    </div>
                    <div className="flex items-center mx-6">
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md text-green-400 hover:bg-gray-700"
                        onClick={() =>
                          updateQuantity(product.id, product.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="mx-4 w-8 text-center text-lg">
                        {product.quantity}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md text-green-400 hover:bg-gray-700"
                        onClick={() =>
                          updateQuantity(product.id, product.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="w-28 text-right font-medium text-white text-lg">
                      {(product.price * product.quantity).toFixed(2)} DT
                    </div>
                  </div>
                ))}

                {/* Total Section */}
                <div className="bg-gray-900 rounded-2xl p-6 shadow-md">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <span className="text-2xl font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-green-400">
                      {calculateTotal().toFixed(2)} DT
                    </span>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition-colors">
                      <ArrowLeft size={18} />
                      Continue Shopping
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex-grow">
                      <CreditCard size={18} />
                      Confirm Purchase
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
