export class OrderItem {
    productId: string;
    quantity: number;

    constructor({
        productId,
        quantity,
    }: {
        productId: string;
        quantity: number;
    }) {
        this.productId = productId;
        this.quantity = quantity;
    }
}
  
  
export class Order {
    customerId: string;
    orderStatus: string;
    totalAmount: number;
    orderItems?: OrderItem[];
    createdAt: Date;

    constructor({
        customerId,
        orderStatus,
        totalAmount,
        orderItems,
        createdAt,
    }: {
        customerId: string;
        orderStatus: string;
        totalAmount: number;
        orderItems?: OrderItem[];
        createdAt: Date;
    }) {
        this.customerId = customerId;
        this.orderStatus = orderStatus;
        this.totalAmount = totalAmount;
        this.orderItems = orderItems;
        this.createdAt = createdAt;
    }

}