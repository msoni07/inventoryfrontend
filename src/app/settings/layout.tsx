'use client';

import AppLayout from '@/components/layout/AppLayout';
import withAuthGuard from '@/Auth/withAuthGuard';
import React from 'react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsPageLayout = ({ children }: SettingsLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuthGuard(SettingsPageLayout);
