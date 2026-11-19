export interface PurchaseItem {
    amount: number; // in cents
    createdAt: Date;
    currency: string;
    description: string;
    id: string;
    isPlatform: boolean;
    status: string;
}
