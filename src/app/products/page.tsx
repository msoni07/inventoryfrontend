'use client';
import withAuth from '../../../components/Auth/withAuth';

function ProductsPage() {
    return <h1 className="text-2xl font-bold">Products</h1>;
}

export default withAuth(ProductsPage); 