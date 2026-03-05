export type Role = 'DEVELOPER' | 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | 'BUYER';

export interface User {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parentId: string | null;
    order: number;
    isActive: boolean;
    createdAt: Date;
    children?: Category[];
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    categoryId: string;
    images: string[];
    specifications: Record<string, string>;
    isFeatured: boolean;
    isActive: boolean;
    tags?: string;
    createdAt: Date;
    updatedAt: Date;
    category?: Category;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    authorId: string;
    isPublished: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    author?: User;
}

export interface SiteSetting {
    id: string;
    key: string;
    value: string;
}

export interface ContactInquiry {
    id: string;
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    country: string | null;
    message: string;
    productInterest: string | null;
    status: 'NEW' | 'READ' | 'REPLIED';
    createdAt: Date;
}

export interface RFQ {
    id: string;
    productId: string | null;
    productName: string | null;
    buyerName: string;
    buyerEmail: string;
    buyerCompany: string | null;
    buyerPhone: string | null;
    buyerCountry: string | null;
    quantity: number;
    targetPrice: string | null;
    deliveryDate: Date | null;
    shippingTo: string | null;
    specialRequirements: string | null;
    status: string;
    adminNotes: string | null;
    quotedPrice: string | null;
    quotedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItem {
    id: string;
    menuLocation: string;
    label: string;
    url: string;
    target: string;
    icon: string | null;
    parentId: string | null;
    order: number;
    isMegaMenu: boolean;
    megaMenuData: string | null;
    isActive: boolean;
    createdAt: Date;
}

export interface MediaFile {
    id: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    folder: string;
    alt: string | null;
    uploadedBy: string | null;
    createdAt: Date;
}

export interface CustomForm {
    id: string;
    name: string;
    slug: string;
    fields: string;
    submitEmail: string | null;
    successMessage: string | null;
    isActive: boolean;
    createdAt: Date;
}
