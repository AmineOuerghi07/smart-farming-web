export class Product {
    id: number;
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    quantity: number; // Add this field
    reviews: any;

    constructor(
        id: number,
        _id: string,
        name: string,
        description: string,
        price: number,
        category: string,
        image: string,
        quantity: number = 0 // Default quantity to 0
    ) {
        this.id = id;
        this._id = _id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.image = image;
        this.quantity = quantity;
    }
}