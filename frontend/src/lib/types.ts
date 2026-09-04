export interface Author {
  id: number;
  name: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'code' 
  | 'callout' 
  | 'image' 
  | 'video' 
  | 'list' 
  | 'quote';

export interface RichBlock {
  type: BlockType;
  level?: 2 | 3 | 4; // Untuk heading
  text?: string;
  language?: string; // Untuk code snippet
  code?: string;
  calloutType?: 'info' | 'warning' | 'danger';
  url?: string; // Untuk image URL atau YouTube embed
  caption?: string;
  alt?: string;
  items?: string[]; // Untuk list
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  videoUrl?: string;
  coverImageUrl: string;
  readingTime: number; // Dalam menit
  publishedAt: string;
  category?: Category;
  tags?: Tag[];
  author?: Author;
  featured?: boolean;
}
