'use client'; 

import AppLayout from '@/components/layout/AppLayout';
import withAuth from '@/components/Auth/withAuth'; 
import React from 'react';

interface ReportsLayoutProps {
  children: React.ReactNode;
}

const ReportsPageLayout = ({ children }: ReportsLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuth(ReportsPageLayout);
