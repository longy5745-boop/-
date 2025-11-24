
export type ViewState = 'HOME' | 'MALL' | 'RECYCLE_FORM' | 'INFO_HALL' | 'PRODUCT_DETAIL' | 'SERVICE_DETAIL';

export interface Product {
    id: number;
    name: string;
    price: string;
    image: string; // Placeholder URL
    aiPrompt?: string; // Prompt for Gemini generation
    category: string;
    origin: string;
    tags?: string[];
}

export interface ServiceItem {
    id: string;
    title: string;
    icon: string;
    description: string;
    details: string; // Extended details for the micro-page
}

export interface MarketItem {
    name: string;
    spec: string; // e.g., "14 water"
    price: number;
    unit: string;
    change: number; // percentage
}

export interface PriceData {
    day: string;
    price: number;
    product: string;
}

export enum SmartTab {
    DISPATCH = 'dispatch',
    RECYCLE = 'recycle',
    PRICES = 'prices',
    POLICY = 'policy'
}
