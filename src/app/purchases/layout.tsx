'use client';

import AppLayout from '@/components/layout/AppLayout';
import withAuthGuard from '@/Auth/withAuthGuard';
import React from 'react';

interface PurchasesLayoutProps {
  children: React.ReactNode;
}

const PurchasesPageLayout = ({ children }: PurchasesLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuthGuard(PurchasesPageLayout);
