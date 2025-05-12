
import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, CreditCard, Sun, Moon } from "lucide-react";
import extractShoppingCart from "../methodes/shoppingCartMethodes";
import { Product } from "../classes/Product";
import { useDispatch } from "react-redux";
import { reset } from "../state/totalPriceSlice/totalPriceSlice";
import { resetCount } from "../state/counter/counterSlice";
import { Order } from "../classes/Order";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const ShoppingCart: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { darkMode } = useTheme();
  const dispatch = useDispatch();
  const [customerId, setCustomerId] = useState<string | null>(null);


  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);




  const getUserIdFromToken = (token: string): string | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const { id } = JSON.parse(jsonPayload);
      return id;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  };



  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token ) {
          
          setLoading(false);
          navigate('/login');
          return;
        }

        const userId = getUserIdFromToken(token);
        console.log("aaaaaaaaaaaaaaaaaaaa", userId);
        if (!userId) {

          setLoading(false);
          navigate('/login');
          return;
        }
        setCustomerId(userId);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // setLoading(false);
        // navigate('/login');
      }
    };

    checkAuthAndFetchData();
  }, [isAuthenticated, navigate]);






  // Load cart products on component mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartProducts = await extractShoppingCart();
        console.log("Loaded cart products:", cartProducts);
        setProducts(cartProducts);
      } catch (error) {
        console.error("Error loading cart products:", error);
      }
    };
    loadCart();
  }, []);

  // Update the quantity of a product
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, quantity: newQuantity } : p))
    );

    const cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    const updatedCart = cart.map((item: { id: string; quantity: number }) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
  };

  // Calculate total
  const calculateTotal = () => {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  // Handle Order
  const handleConfirmPurchase = async () => {
    const cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");

    const orderPayload: Order = {
      totalAmount: calculateTotal(),
      customerId: customerId?.toString() || "",
      orderStatus: "pending",
      orderItems: cart.map((item: { id: string; quantity: number }) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      createdAt: new Date(),
    };

    try {
      const response = await axios.post(`http://localhost:3000/order`, orderPayload);
      console.log("Order created successfully:", response.data);

      dispatch(reset());
      dispatch(resetCount());
      localStorage.setItem("shoppingCart", JSON.stringify([]));
      setProducts([]);

      toast.success("Order placed successfully! 🎉", { position: "top-center" });
    } catch (error) {
      console.error("Failed to create an order:", error);
      toast.error("Failed to place the order. Please try again!", { position: "top-center" });
    }
  };

  return (
    <div className={`flex w-full min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className="flex-1 flex justify-center items-start py-6 sm:py-10 px-4">
        <div className="w-full max-w-4xl">
          <div className={darkMode ? "text-white" : "text-gray-800"}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-4xl font-bold">Shopping Cart</h1>
            </div>

            {products.length === 0 ? (
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                Your cart is currently empty.
              </p>

            ) : (
              <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 flex items-center shadow-md`}

                  >
                    <div className="flex-shrink-0 mr-6">
                      <img
                        src={`http://localhost:3000/uploads/${product.image}`}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    </div>
                    <div className="flex-grow">
                      <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {product.name}
                      </h2>
                      <p className={`${darkMode ? 'text-green-400' : 'text-green-600'} text-lg mt-1`}>

                        {product.price.toFixed(2)} DT
                      </p>
                    </div>
                    <div className="flex items-center mx-6">
                      <button
                        className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'bg-gray-800 text-green-400 hover:bg-gray-700' : 'bg-gray-100 text-green-600 hover:bg-gray-200'} rounded-md`}
                        onClick={() =>
                          updateQuantity(product._id, product.quantity - 1)
                        }

                      >
                        -
                      </button>
                      <span className="mx-4 w-8 text-center text-lg">
                        {product.quantity}
                      </span>
                      <button
                        className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'bg-gray-800 text-green-400 hover:bg-gray-700' : 'bg-gray-100 text-green-600 hover:bg-gray-200'} rounded-md`}
                        onClick={() =>
                          updateQuantity(product._id, product.quantity + 1)
                        }

                      >
                        +
                      </button>
                    </div>
                    <div className="w-28 text-right font-medium text-lg">
                      {(product.price * product.quantity).toFixed(2)} DT
                    </div>
                  </div>
                ))}

                {/* Total Section */}
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md`}>
                  <div className={`flex justify-between items-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                    <span className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Total</span>
                    <span className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {calculateTotal().toFixed(2)} DT
                    </span>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button onClick={() => window.location.href = "/store"} className={`flex items-center justify-center gap-2 px-6 py-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-800'} rounded-md font-medium transition-colors`}>

                      <ArrowLeft size={18} />
                      Continue Shopping
                    </button>
                    <button
                      onClick={handleConfirmPurchase}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex-grow"
                    >
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
      {/* Toast container for notifications */}
      <ToastContainer />
    </div>
  );
};

export default ShoppingCart;
