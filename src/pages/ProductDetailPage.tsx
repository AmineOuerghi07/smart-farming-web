import { useEffect, useState } from 'react';
import { Star, ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Product } from '../classes/Product';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { increment } from '../state/counter/counterSlice';
import { incrementByAmount } from '../state/totalPriceSlice/totalPriceSlice';
import { useNavigate } from 'react-router';


export default function ProductDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState<any | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [relatedProducts, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Fetch the list of products
        fetch('http://localhost:3000/product')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch products');
                return res.json();
            })
            .then((data: Product[]) => {
                // Find the product with the matching _id
                const matchedProduct = data.find((product) => product._id === id);
                const relatedProducts = data.filter((product) => product.category === matchedProduct?.category && product._id !== matchedProduct?._id);
                if (matchedProduct) {
                    setProduct(setProductdata(matchedProduct)); // Use setProductdata to format the product
                    setProducts(relatedProducts); // Set related products
                } else {
                    setProduct(null);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [id]);

    function setProductdata(data: Product) {
        return {
            ...data, // Spread the original product data
            rating: 4.5, // Example static rating
            reviews: 28, // Example static reviews count
            stock: 10, // Example static stock
            images: [
                `http://localhost:3000/uploads/${data.image}`,
                `http://localhost:3000/uploads/${data.image}`,
                `http://localhost:3000/uploads/${data.image}`
            ],
            care: "Water thoroughly but infrequently, allowing soil to dry between waterings. Plant in well-draining soil in a location with at least 6 hours of sunlight. Protect from strong winds and frost in cooler climates."
        };
    }

    const dispatch = useDispatch();


    const incrementQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    fill={i <= Math.round(rating) ? "#FFD700" : "none"}
                    color={i <= Math.round(rating) ? "#FFD700" : "#ccc"}
                />
            );
        }
        return stars;
    };

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen w-screen bg-gray-900">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
                    <div className="mb-6">
                        <a href="/store" className="flex items-center text-green-500 hover:underline">
                            <ArrowLeft size={16} className="mr-1" />
                            <span>Back to Store</span>
                        </a>
                        <div className="flex items-center text-sm text-white-200 font-medium mt-2">
                            <a href="#" className="hover:text-green-700">Store</a>
                            <span className="mx-2">/</span>
                            <a href="#" className="hover:text-green-700">{product.category}</a>
                            <span className="mx-2">/</span>
                            <span className="text-white-200">{product.name}</span>
                        </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            {/* Product Images */}
                            <div className="space-y-4">
                                <div className="border rounded-lg overflow-hidden">
                                    <img src={product.images[0]} alt={product.name} className="w-full h-64 object-cover" />
                                </div>
                                <div className="flex space-x-2">
                                    {product.images.map((img: string, index: number) => (
                                        <div key={index} className={`border rounded-lg overflow-hidden cursor-pointer ${index === 0 ? 'ring-2 ring-green-500' : ''}`}>
                                            <img src={img} alt={`${product.name} - view ${index + 1}`} className="w-20 h-20 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-4">
                                <h1 className="text-2xl font-bold text-white">{product.name}</h1>

                                <div className="flex items-center">
                                    <div className="flex mr-2">
                                        {renderStars(product.rating)}
                                    </div>
                                    <span className="text-sm text-white">({product.reviews} reviews)</span>
                                </div>

                                <p className="text-2xl font-bold text-green-400">${product.price.toFixed(2)}</p>

                                <div className="text-sm text-white">
                                    <span className={product.stock > 0 ? 'text-white' : 'text-red-600'}>
                                        {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                                    </span>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex items-center mb-4">
                                        <span className="mr-3 text-white">Quantity:</span>
                                        <div className="flex items-center border text-white rounded-md">
                                            <button
                                                onClick={decrementQuantity}
                                                className="px-3 py-1 text-white hover:bg-gray-600"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-3 py-1 text-white">{quantity}</span>
                                            <button
                                                onClick={incrementQuantity}
                                                className="px-3 py-1 text-white hover:bg-gray-600"
                                                disabled={quantity >= product.stock}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            className="flex-1 bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded-md flex items-center justify-center"
                                            onClick={() => {
                                                const cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
                                                const existingProductIndex = cart.findIndex((item: { id: string }) => item.id === product._id);

                                                if (existingProductIndex !== -1) {
                                                    // If product exists, update the quantity
                                                    cart[existingProductIndex].quantity += quantity;
                                                } else {
                                                    // If product doesn't exist, add it to the cart
                                                    cart.push({ id: product._id, quantity });
                                                }

                                                localStorage.setItem("shoppingCart", JSON.stringify(cart));

                                                for (let i = 0; i < quantity; i++) {
                                                    dispatch(increment());
                                                } // Increment the counter in the Redux store
                                                dispatch(incrementByAmount(product.price * quantity)); // Update the total price in the Redux store

                                            }}
                                        >
                                            <ShoppingCart size={18} className="mr-2" />
                                            Add to Cart
                                        </button>
                                        <button className="bg-gray-900 hover:bg-gray-600 py-2 px-4 rounded-md">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border- ">
                            <div className="flex border-">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`px-4 py-3 font-medium ${activeTab === 'description' ? 'text-white border-b-2 border-green-400' : 'text-gray-300 hover:text-green-400'}`}
                                >
                                    Description
                                </button>

                                <button
                                    onClick={() => setActiveTab('care')}
                                    className={`px-4 py-3 font-medium ${activeTab === 'care' ? 'text-white border-b-2 border-green-400' : 'text-gray-300 hover:text-green-400'}`}
                                >
                                    Care Instructions
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'description' && (
                                    <p className="text-white">{product.description}</p>
                                )}

                                {activeTab === 'care' && (
                                    <p className="text-white">{product.care}</p>
                                )}
                            </div>
                        </div>

                        {/* Related Products */}
                        <div className="border- p-6">
                            <h2 className="text-xl text-white font-bold mb-4">You might also like</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedProducts.length > 0 ? (
                                    relatedProducts.map((relatedProduct) => (
                                        <div onClick={ () => navigate(`/product_details/${relatedProduct._id}`)}
                                            key={relatedProduct._id}
                                            className="border text-gray-200 rounded-lg overflow-hidden bg-gray-00 hover:shadow-md transition-shadow"
                                        >
                                            <img
                                                src={`http://localhost:3000/uploads/${relatedProduct.image}`}
                                                alt={relatedProduct.name}
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="p-3">
                                                <h3 className="font-medium text-white">{relatedProduct.name}</h3>
                                                <p className="text-green-400 font-bold mt-1">${relatedProduct.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-white">No related products found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}