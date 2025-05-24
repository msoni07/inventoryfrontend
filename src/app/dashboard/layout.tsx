'use client';

import AppLayout from '@/components/layout/AppLayout';
import withAuthGuard from '@/Auth/withAuthGuard';
import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardPageLayout = ({ children }: DashboardLayoutProps) => {
    return <AppLayout>{children}</AppLayout>;
};

export default withAuthGuard(DashboardPageLayout);
