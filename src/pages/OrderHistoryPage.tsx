import { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Product } from '../classes/Product';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  total: string;
}

interface BackendOrder {
  _id: string;
  customerId: string;
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
  referenceId: string;
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
  const [_customerId, setCustomerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  const getUserIdFromToken = (token: string): string | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
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
        if (!token) {
          setLoading(false);
          navigate('/login');
          return;
        }
        const userId = getUserIdFromToken(token);
        if (!userId) {
          setLoading(false);
          navigate('/login');
          return;
        }
        setCustomerId(userId.toString());
      } catch (error) {
        console.error('Error checking authentication:', error);
        setLoading(false);
        navigate('/login');
      }
    };
    checkAuthAndFetchData();
  }, [isAuthenticated, navigate]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3000/order');
      let data = res.data as BackendOrder[];
      data = data.filter((order) => order.customerId === _customerId);
      const transformed: Order[] = await Promise.all(
        data.map(async (order) => ({
          id: order._id,
          referenceId: order.referenceId,
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
    if (_customerId) {
      fetchOrders();
    }
  }, [_customerId]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    let y = 20;

    // Header bar
    pdf.setFillColor(40, 102, 183);
    pdf.rect(0, 0, 210, 30, 'F');
    pdf.setFontSize(22);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    pdf.text(' Order History Report', 14, 20);

    y = 40;

    orders.forEach((order, orderIndex) => {
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }

      const referenceId = order.referenceId || '-';
      const orderDate = order.date || '-';
      const status = order.status || '-';
      const total = order.total || '0';

      // Order Card
      pdf.setDrawColor(220);
      pdf.setFillColor(245, 248, 255);
      pdf.roundedRect(12, y, 186, 12 + 6 + (order.items?.length || 0) * 7 + 14, 3, 3, 'FD');

      y += 10;
      pdf.setFontSize(13);
      pdf.setTextColor(33, 37, 41);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Order #${referenceId}`, 16, y);

      y += 6;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(` Date: ${orderDate}`, 16, y);
      pdf.text(` Status: ${status}`, 80, y);
      pdf.text(` Total: ${total}`, 150, y);

      y += 6;

      // Table header
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 30, 30);
      pdf.text(' Item', 16, y);
      pdf.text('Qty', 100, y);
      pdf.text('Price', 130, y);
      pdf.text('Total', 160, y);
      y += 2;
      pdf.setDrawColor(230);
      pdf.line(16, y, 190, y);
      y += 4;

      // Items
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      order.items?.forEach((item, index) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }

        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(14, y - 3, 182, 7, 'F');
        }

        const itemName = item.name || '-';
        const quantity = item.quantity?.toString() || '0';
        const price = item.price || '0';
        const itemTotal = item.total || '0';

        pdf.setTextColor(60);
        pdf.text(itemName, 16, y);
        pdf.text(quantity, 100, y);
        pdf.text(price, 130, y);
        pdf.text(itemTotal, 160, y);

        y += 7;
      });

      // Total Summary
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(28, 110, 77);
      pdf.text(`Order Total: ${total}`, 150, y + 2);

      y += 14;
    });

    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text('Generated by AgriSmart · www.agrismart.tn', 14, 290);

    pdf.save('order_history.pdf');
  };


  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white overflow-auto">
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Order History</h2>
          <button
            onClick={generatePDF}
            className="flex items-center bg-green-600 text-white px-3 py-2 rounded hover:bg-green-500"
          >
            <FileText className="mr-2 h-5 w-5" />
            Download PDF
          </button>
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
                      <h3 className="text-lg font-medium">Order #{order.referenceId}</h3>
                      <span
                        className={`ml-3 px-2 py-1 text-xs rounded-full ${order.status === 'Delivered'
                          ? 'bg-green-600'
                          : 'bg-blue-600'
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
                    <span className="text-xl font-semibold text-green-400 mr-4">{order.total}</span>
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

        {/* Pagination */}
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
