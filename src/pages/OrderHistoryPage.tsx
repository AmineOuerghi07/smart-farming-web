import { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../classes/Product';

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  total: string;
}

interface BackendOrder {
  _id: string;
  createdAt: string;
  totalAmount: number;
  orderStatus: string;
  referenceId: string;
  orderItems: {
    quantity: number;
    productId: string;
  }[];
}

interface Order {
  id: string;
  referenceId: string; // NEW: Human-readable id
  date: string;
  total: string;
  status: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;



  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3000/order');
      const data = res.data as BackendOrder[];

      const transformed: Order[] = await Promise.all(
        data.map(async (order) => ({
          id: order._id,
          referenceId: order.referenceId, // NEW
          date: new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          total: `${(order.totalAmount ?? 0).toFixed(2)} DT`,
          status: order.orderStatus === 'pending' ? 'Processing' : order.orderStatus,
          items: await Promise.all(
            order.orderItems.map(async (item) => {
              try {
                const productRes = await axios.get(`http://localhost:3000/product/${item.productId}`);
                const productData = productRes.data as Product;

                return {
                  name: productData.name ?? 'Unknown Product',
                  quantity: item.quantity,
                  price: `${(productData.price ?? 0).toFixed(2)} DT`,
                  total: `${((productData.price ?? 0) * item.quantity).toFixed(2)} DT`,
                };
              } catch (err) {
                console.error(`Failed to fetch product details for ID: ${item.productId}`, err);
                return {
                  name: 'Unknown Product',
                  quantity: item.quantity,
                  price: 'N/A',
                  total: 'N/A',
                };
              }
            })
          ),
        }))
      );

      setOrders(transformed);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white overflow-auto">
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Order History</h2>
        </div>

        {orders.length === 0 ? (
          <p className="text-center text-gray-400">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between bg-gray-800 border-b border-gray-700">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">Order #{order.referenceId}</h3> {/* 👈 Now using fancy number */}
                      <span
                        className={`ml-3 px-2 py-1 text-xs rounded-full ${order.status === 'Delivered' ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{order.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl font-semibold text-green-400 mr-4">
                      {order.total}
                    </span>
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="p-1 rounded-full hover:bg-gray-700"
                    >
                      {expandedOrders[order.id] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedOrders[order.id] && (
                  <div className="p-4 bg-gray-850">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400">
                            <th className="pb-2">Item</th>
                            <th className="pb-2 text-center">Quantity</th>
                            <th className="pb-2 text-right">Price</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-gray-700">
                              <td className="py-3">{item.name}</td>
                              <td className="py-3 text-center">{item.quantity}</td>
                              <td className="py-3 text-right">{item.price}</td>
                              <td className="py-3 text-right text-green-400">{item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-700 font-medium">
                            <td colSpan={3} className="pt-3 text-right">
                              Order Total:
                            </td>
                            <td className="pt-3 text-right text-green-400">{order.total}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            <button
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-1 rounded ${currentPage === page ? 'bg-green-700' : 'bg-gray-800 hover:bg-gray-700'
                  } text-sm`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
