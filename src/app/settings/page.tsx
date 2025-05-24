'use client';
import withAuth from '../../../components/Auth/withAuth';

function SettingsPage() {
    return <h1 className="text-2xl font-bold">Settings</h1>;
}

export default withAuth(SettingsPage); 