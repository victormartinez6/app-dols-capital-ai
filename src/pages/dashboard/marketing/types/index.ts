import { DBSchema } from 'idb';

// Definição do esquema do IndexedDB
export interface MarketingDBSchema extends DBSchema {
  files: {
    key: string;
    value: {
      id: string;
      name: string;
      category: 'artes' | 'documentos' | 'apresentacoes' | 'videos' | 'restrita';
      fileBlob: Blob;
      thumbnailBlob?: Blob;
      fileType: string;
      fileSize: number;
      createdAt: Date;
      createdBy: string;
      description?: string;
      isCarousel?: boolean;
      carouselBlobs?: Blob[];
      imageCount?: number;
      isPersisted?: boolean;
    };
    indexes: { 'by-category': string };
  };
}

// Tipos para arquivos de marketing
export interface MarketingFile {
  id: string;
  name: string;
  category: 'artes' | 'documentos' | 'apresentacoes' | 'videos' | 'restrita';
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  createdBy: string;
  description?: string;
  isCarousel?: boolean;
  carouselUrls?: string[];
  imageCount?: number;
  isPersisted?: boolean; // Indica se o arquivo está persistido no Firebase Storage
}

// Tipo para formatação de texto
export interface TextFormatting {
  bold: boolean;
  italic: boolean;
  list?: boolean;
}

// Categorias de marketing
export type MarketingCategory = 'artes' | 'documentos' | 'apresentacoes' | 'videos' | 'restrita';

// Tipo de upload
export type UploadType = 'single' | 'carousel';
