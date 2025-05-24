'use client';

import AppLayout from '@/components/layout/AppLayout';
import withAuthGuard from '@/Auth/withAuthGuard';
import React from 'react';

interface ProductsLayoutProps {
  children: React.ReactNode;
}

const ProductsPageLayout = ({ children }: ProductsLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuthGuard(ProductsPageLayout);
