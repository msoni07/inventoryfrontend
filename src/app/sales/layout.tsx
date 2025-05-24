'use client'; 

import AppLayout from '@/components/layout/AppLayout';
import withAuth from '@/components/Auth/withAuth'; 
import React from 'react';

interface SalesLayoutProps {
  children: React.ReactNode;
}

const SalesPageLayout = ({ children }: SalesLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuth(SalesPageLayout);
