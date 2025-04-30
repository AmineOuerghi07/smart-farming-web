export class Product {
    id: number;
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    quantity: number; // Add this field
    stockQuantity: number; // Add this field
    rating?: { user_id: string, rating: number }[];
    constructor(
        id: number,
        _id: string,
        name: string,
        description: string,
        price: number,
        category: string,
        image: string,
        quantity: number = 0,// Default quantity to 0
        stockQuantity: number = 0, // Default stock quantity to 0
        rating: { user_id: string, rating: number }[] = []
    ) {
        this.id = id;
        this._id = _id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.image = image;
        this.quantity = quantity;
        this.stockQuantity = stockQuantity; // Initialize stock quantity
        this.rating = rating;
    }
}