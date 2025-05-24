'use client'; 

import AppLayout from '@/components/layout/AppLayout';
import withAuth from '@/components/Auth/withAuth'; 
import React from 'react';

interface PurchasesLayoutProps {
  children: React.ReactNode;
}

const PurchasesPageLayout = ({ children }: PurchasesLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuth(PurchasesPageLayout);
