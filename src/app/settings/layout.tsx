'use client'; 

import AppLayout from '@/components/layout/AppLayout';
import withAuth from '@/components/Auth/withAuth'; 
import React from 'react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsPageLayout = ({ children }: SettingsLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default withAuth(SettingsPageLayout);
