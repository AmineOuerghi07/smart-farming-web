import { useState, useEffect } from 'react';
import { Star, ChevronDown, Search } from 'lucide-react';
import { Range, getTrackBackground } from 'react-range';
import { Product } from '../classes/Product';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';

export default function Store() {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
    const [maxPrice, setMaxPrice] = useState<number>(300);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('default');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://localhost:3000/product')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch products');
                return res.json();
            })
            .then((data) => {
                setProducts(data);
                setFilteredProducts(data);

                const prices = data.map((p: Product) => p.price);
                const highest = Math.max(...prices);
                setMaxPrice(highest);
                setPriceRange([0, highest]);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    useEffect(() => {
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        setCategories(uniqueCategories);
    }, [products]);

    useEffect(() => {
        let result = [...products];
        const term = searchTerm.trim().toLowerCase();

        if (term) {
            const startsWithMatches = result.filter(product =>
                product.name?.toLowerCase().startsWith(term)
            );
            const includesMatches = result.filter(product =>
                !product.name?.toLowerCase().startsWith(term) &&
                (product.name?.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term))
            );
            result = [...startsWithMatches, ...includesMatches];
        }

        result = result.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        if (selectedCategories.length > 0) {
            result = result.filter(product =>
                selectedCategories.includes(product.category)
            );
        }

        switch (sortBy) {
            case 'priceLow':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'priceHigh':
                result.sort((a, b) => b.price - a.price);
                break;

            default:
                break;
        }

        setFilteredProducts(result);
    }, [products, searchTerm, priceRange, selectedCategories, sortBy]);

    const handleCategoryChange = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(cat => cat !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    fill={i <= Math.round(rating) ? "gold" : "none"}
                    color={i <= Math.round(rating) ? "gold" : "gray"}
                />
            );
        }
        return stars;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            <header className={`${darkMode ? 'bg-gray-900' : 'bg-white'} ${darkMode ? 'text-white' : 'text-gray-800'} p-4 shadow-md`}>
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">Store</h1>
                </div>
            </header>

            <main className="container mx-auto p-4 flex-grow text-gray-900">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:min-w-[260px] md:max-w-[260px] max-h-[600px] overflow-auto bg-gray-800 p-4 rounded-lg shadow-md flex-shrink-0">


                        <h2 className="text-lg text-white font-semibold mb-4">Filters</h2>

                        <div className="mb-6">
                            <label className="block text-sm text-white font-medium mb-2">Search</label>
                            <div className="relative ">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full p-2 border rounded-md pl-8 text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white" />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-white font-medium mb-2">
                                Price Range: ${priceRange[0]} - ${priceRange[1]}
                            </label>
                            <Range
                                values={priceRange}
                                step={1}
                                min={0}
                                max={maxPrice}
                                onChange={(values) => setPriceRange(values as [number, number])}
                                renderTrack={({ props, children }) => (
                                    <div
                                        {...props}
                                        style={{
                                            ...props.style,
                                            height: '6px',
                                            width: '100%',
                                            background: getTrackBackground({
                                                values: priceRange,
                                                colors: ['#ccc', '#4ade80', '#ccc'],
                                                min: 0,
                                                max: maxPrice
                                            }),
                                            borderRadius: '4px',
                                            marginTop: '10px'
                                        }}
                                    >
                                        {children}
                                    </div>
                                )}
                                renderThumb={({ props }) => (
                                    <div
                                        {...props}
                                        style={{
                                            ...props.style,
                                            height: '16px',
                                            width: '16px',
                                            backgroundColor: '#4ade80',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 0 2px white',
                                            cursor: 'pointer'
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-white font-medium mb-2">Categories</label>
                            {categories.map(category => (
                                <div key={category} className="flex items-center text-white mb-2">
                                    <input
                                        type="checkbox"
                                        id={category}
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => handleCategoryChange(category)}
                                        className="mr-2 "
                                    />
                                    <label htmlFor={category}>{category}</label>
                                </div>
                            ))}
                        </div>

                        <div className="mb-6 ">
                            <label className="block text-sm text-white font-medium mb-2">Sort By</label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full p-2 border bg-gray-700 text-white rounded-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="default" className="bg-gray-700 text-white">Default</option>
                                    <option value="priceLow" className="bg-gray-700 text-white">Price: Low to High</option>
                                    <option value="priceHigh" className="bg-gray-700 text-white">Price: High to Low</option>
                                    <option value="rating" className="bg-gray-700 text-white">Top Rated</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow">
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <p className="text-xl text-white">No products found matching your criteria.</p>
                            </div>
                        ) : (

                            <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProducts.map((product) => (

                                    <div key={product.id}
                                        onClick={() => navigate(`/product_details/${product._id}`)}
                                        className=" bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        <img
                                            src={`http://localhost:3000/uploads/${product.image}`}
                                            alt={product.name}
                                            className="w-full h-48  object-cover"
                                        />
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-lg text-white">{product.name}</h3>
                                                <span className="font-bold text-green-600">${product.price.toFixed(2)}</span>
                                            </div>
                                            <p className="text-white text-sm mb-2 line-clamp-2">{product.description}</p>
                                            <div className="flex items-center">
                                                <div className="flex mr-1">
                                                    {renderStars(5)}
                                                </div>
                                                <span className="text-sm text-white">({5})</span>
                                            </div>
                                            <div className="mt-3">
                                                <button className="bg-green-600 text-white py-1 px-3 rounded-md text-sm hover:bg-green-400 transition-colors">
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                ))}
                            </div>

                        )}
                    </div>
                </div>
            </main>


        </div>
    );
}
