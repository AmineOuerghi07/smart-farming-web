import { Product } from "../classes/Product";

export default async function extractShoppingCart(): Promise<Product[]> {
    // Retrieve the cart from localStorage
    const cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");

    // Fetch all products from the backend
    const allProducts = await fetch('http://localhost:3000/product')
        .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        });

    // Filter products to include only those in the cart
    const productsInCart = allProducts
        .filter((product: Product) =>
            cart.some((item: { id: string }) => item.id === product._id.toString())
        )
        .map((product: Product) => {
            const cartItem = cart.find((item: { id: string }) => item.id === product._id.toString());
            return {
                ...product,
                quantity: cartItem ? cartItem.quantity : 0, // Replace quantity with the value from localStorage
            };
        });

    return productsInCart;
}