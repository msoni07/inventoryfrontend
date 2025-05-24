'use client';

import AppLayout from '@/components/layout/AppLayout';
import withAuthGuard from '@/Auth/withAuthGuard';
import React from 'react';

interface StockLayoutProps {
  children: React.ReactNode;
}

const StockPageLayout = ({ children }: StockLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuthGuard(StockPageLayout);
