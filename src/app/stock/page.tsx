'use client';
import withAuth from '../../../components/Auth/withAuth';

function StockPage() {
    return <h1 className="text-2xl font-bold">Stock</h1>;
}

export default withAuth(StockPage); 