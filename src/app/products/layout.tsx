'use client'; 

import AppLayout from '@/components/layout/AppLayout';
import withAuth from '@/components/Auth/withAuth'; 
import React from 'react';

interface ProductsLayoutProps {
  children: React.ReactNode;
}

const ProductsPageLayout = ({ children }: ProductsLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuth(ProductsPageLayout);
