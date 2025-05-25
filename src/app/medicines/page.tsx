'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getMedicines } from '@/services/inventoryService'; // Import the new service function
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Assuming you have a shadcn/ui table component
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui button
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'; // Icons for pagination and sorting
import { format } from 'date-fns'; // For formatting dates
import { cn } from '@/lib/utils'; // Import the cn utility
import withAuthGuard from '@/Auth/withAuthGuard'; // Import the HOC

// Define the shape of a medicine item based on your API response
interface Medicine {
  _id: string;
  name: string;
  manufacturer: string;
  saltComposition: string;
  batchNumber: string;
  expiryDate: string; // Or Date if you parse it
  mrp: number;
  purchasePrice: number;
  quantityInStock: number;
  hsnCode: string;
  gstPercentage: number;
  scheduleType: string;
  barcode: string;
  // lastUpdatedBy?: { _id: string; username: string; email: string }; // Optional - can add if needed in table
  // createdAt: string; // Or Date
  // updatedAt: string; // Or Date
}

// Define the shape of the sorting state
interface SortConfig {
  key: keyof Medicine;
  direction: 'asc' | 'desc';
}

// Define the shape of the filter state
interface FilterState {
  name?: string;
  manufacturer?: string;
  saltComposition?: string;
  expiryDate?: string; // Using string for simplicity; can be Date or range
  // Add other filterable fields here
}

function ProductsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Keep limit constant for simplicity in this example
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterState>({}); // Add filter state
  const [searchTerm, setSearchTerm] = useState<string>(''); // Add search term state

  // Use a ref to track if the effect has run its initial pass
  const effectRan = useRef(false);

  useEffect(() => {
    // Define the fetch function inside useEffect to access state variables
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build params object conditionally, excluding empty filter/search values
        const params: any = { // Use any for now to easily spread, or build a proper type
          page: currentPage,
          limit: limit,
          ...(sortConfig && { sortBy: sortConfig.key, sortOrder: sortConfig.direction }),
        };

        // Add filters to params only if they have a non-empty value
        Object.keys(filters).forEach(key => {
          const filterValue = filters[key as keyof FilterState];
          if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
            params[key] = filterValue;
          }
        });

        // Add search term to params only if it has a non-empty value
        if (searchTerm !== '') {
          params.search = searchTerm;
        }

        const data = await getMedicines(params);
        setMedicines(data.medicines);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch medicines.');
      } finally {
        setLoading(false);
      }
    };

    // Prevent fetching on the very first render (part of Strict Mode double render)
    if (!effectRan.current) {
      effectRan.current = true;
      return; // Skip the fetch on the first run
    }

    // Fetch data on subsequent renders or when dependencies change
    fetchMedicines();

  }, [currentPage, limit, sortConfig, filters, searchTerm]); // Add searchTerm to dependencies

  const handleSort = (key: keyof Medicine) => {
    let direction: SortConfig['direction'] = 'asc';
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        // If already descending, reset sorting
        setSortConfig(null);
        // Reset to first page if sorting is removed
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
        return;
      }
    }
    setSortConfig({ key, direction });
    // Reset to first page when sorting changes for a new column or direction
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Helper to get sort icon
  const getSortIcon = (key: keyof Medicine) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={16} className="ml-2" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp size={16} className="ml-2" />;
    }
    return <ArrowDown size={16} className="ml-2" />;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle filter input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset to first page when search term changes
    setCurrentPage(1);
  };

  // Handle reset button click
  const handleReset = () => {
    setCurrentPage(1);
    setSortConfig(null);
    setFilters({}); // Reset filters
    setSearchTerm(''); // Reset search term
  };

  // Define filterable columns and their corresponding input types/labels
  const filterableColumns = [
    { key: 'name', label: 'Filter by Name', type: 'text' },
    { key: 'manufacturer', label: 'Filter by Manufacturer', type: 'text' },
    { key: 'saltComposition', label: 'Filter by Salt Composition', type: 'text' },
    { key: 'expiryDate', label: 'Filter by Expiry Date', type: 'date' }, // Using type 'date' for potential date picker
    // Add other filterable columns here
  ];

  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-6">Products</h1> */}

      {/* General Search Input */}
      <div className="mb-4 w-full">
        <label htmlFor="generalSearch" className="block text-sm font-medium text-gray-700 mb-1">
          Search Products
        </label>
        <input
          type="text"
          id="generalSearch"
          name="generalSearch"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, manufacturer, etc."
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
        />
      </div>

      {/* Filter Inputs */}
      <div className="mb-4 flex flex-wrap gap-4">
        {filterableColumns.map((filterCol) => (
          <div key={filterCol.key} className="w-48 flex-grow">
            <label htmlFor={filterCol.key} className="block text-sm font-medium text-gray-700 mb-1">
              {filterCol.label}
            </label>
            <input
              type={filterCol.type}
              id={filterCol.key}
              name={filterCol.key}
              value={filters[filterCol.key as keyof FilterState] || ''}
              onChange={handleFilterChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>
        ))}
      </div>

      {loading && <p>Loading medicines...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[ // Table columns based on your request
                    { key: 'name', label: 'Name' },
                    { key: 'manufacturer', label: 'Manufacturer' },
                    { key: 'saltComposition', label: 'Salt Composition' },
                    { key: 'batchNumber', label: 'Batch Number' },
                    { key: 'expiryDate', label: 'Expiry Date' },
                    { key: 'mrp', label: 'MRP' },
                    { key: 'purchasePrice', label: 'Purchase Price' },
                    { key: 'quantityInStock', label: 'Quantity in Stock' },
                    { key: 'hsnCode', label: 'HSN Code' },
                    { key: 'gstPercentage', label: 'GST Percentage' },
                    { key: 'scheduleType', label: 'Schedule Type' },
                    { key: 'barcode', label: 'Barcode' },
                  ].map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "h-12 px-4 text-left align-middle font-medium text-gray-600 [&:has([role=checkbox])]:pr-0",
                        sortConfig?.key === column.key && "bg-green-100" // Apply light green background if sorted
                      )}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key as keyof Medicine)}
                        className="flex items-center space-x-1 -ml-3"
                      >
                        {column.label}
                        {getSortIcon(column.key as keyof Medicine)}
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((medicine) => (
                  <TableRow key={medicine._id}>
                    <TableCell>{medicine.name}</TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell>{medicine.saltComposition}</TableCell>
                    <TableCell>{medicine.batchNumber}</TableCell>
                    <TableCell>{format(new Date(medicine.expiryDate), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{medicine.mrp}</TableCell>
                    <TableCell>{medicine.purchasePrice}</TableCell>
                    <TableCell>{medicine.quantityInStock}</TableCell>
                    <TableCell>{medicine.hsnCode}</TableCell>
                    <TableCell>{medicine.gstPercentage}%</TableCell>
                    <TableCell>{medicine.scheduleType}</TableCell>
                    <TableCell>{medicine.barcode}</TableCell>
                  </TableRow>
                ))}
                {medicines.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center">No medicines found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center p-4">
            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={loading && (currentPage !== 1 || sortConfig !== null || Object.keys(filters).some(key => filters[key as keyof FilterState] !== '') || searchTerm !== '')}
              size="sm"
            >
              Reset
            </Button>

            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || loading}
                size="sm"
              >
                <ChevronLeft size={16} className="mr-2" /> Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
                size="sm"
              >
                Next <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthGuard(ProductsPage); // Export the component wrapped with the HOC
