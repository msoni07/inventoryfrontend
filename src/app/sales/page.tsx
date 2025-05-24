'use client';
import withAuth from '../../../components/Auth/withAuth';

function SalesPage() {
    return <h1 className="text-2xl font-bold">Sales</h1>;
}

export default withAuth(SalesPage); 