'use client'; 

import AppLayout from '@/components/layout/AppLayout';
import withAuth from '@/components/Auth/withAuth'; 
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardPageLayout = ({ children }: DashboardLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuth(DashboardPageLayout);
