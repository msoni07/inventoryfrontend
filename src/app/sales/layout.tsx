'use client';

import AppLayout from '@/components/layout/AppLayout';
import withAuthGuard from '@/Auth/withAuthGuard';
import React from 'react';

interface SalesLayoutProps {
  children: React.ReactNode;
}

const SalesPageLayout = ({ children }: SalesLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuthGuard(SalesPageLayout);
