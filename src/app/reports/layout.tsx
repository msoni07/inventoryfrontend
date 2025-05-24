'use client';

import AppLayout from '@/components/layout/AppLayout';
import withAuthGuard from '@/Auth/withAuthGuard';
import React from 'react';

interface ReportsLayoutProps {
  children: React.ReactNode;
}

const ReportsPageLayout = ({ children }: ReportsLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuthGuard(ReportsPageLayout);
