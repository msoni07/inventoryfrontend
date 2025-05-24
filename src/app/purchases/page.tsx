'use client';
import withAuth from '../../../components/Auth/withAuth';

function PurchasesPage() {
    return <h1 className="text-2xl font-bold">Purchases</h1>;
}

export default withAuth(PurchasesPage); 