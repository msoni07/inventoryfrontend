import AppLayout from '@/components/layout/AppLayout';
// import withAuthGuard from '@/Auth/withAuthGuard'; // Remove this import
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medicines',
};

interface ProductsLayoutProps {
  children: React.ReactNode;
}

// This is now a Server Component providing the layout structure and metadata
const ProductsLayout = ({ children }: ProductsLayoutProps) => {
  return (
    <AppLayout>{children}</AppLayout>
  ); // AppLayout is a client component, it will render children (which will be wrapped by withAuthGuard) in the client
};

export default ProductsLayout;
