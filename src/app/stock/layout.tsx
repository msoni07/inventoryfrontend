'use client'; 

import AppLayout from '@/components/layout/AppLayout';
import withAuth from '@/components/Auth/withAuth'; 
import React from 'react';

interface StockLayoutProps {
  children: React.ReactNode;
}

const StockPageLayout = ({ children }: StockLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuth(StockPageLayout);
