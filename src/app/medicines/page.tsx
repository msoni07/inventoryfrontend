'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getMedicines } from '@/services/inventoryService'; // Import the new service function
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Assuming you have a shadcn/ui table component
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui button
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'; // Icons for pagination and sorting
import { format } from 'date-fns'; // For formatting dates
import { cn } from '@/lib/utils'; // Import the cn utility
import withAuthGuard from '@/Auth/withAuthGuard'; // Import the HOC
import { useRouter, useSearchParams } from 'next/navigation'; // Import useRouter and useSearchParams
import toast from 'react-hot-toast'; // Import toast for notifications
import { deleteMedicine } from '@/services/inventoryService'; // Import deleteMedicine service function
import ConfirmDialog from '@/components/ui/ConfirmDialog'; // Import the custom ConfirmDialog component

// Define the shape of a medicine item based on your API response
export interface Medicine {
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

// Define filterable columns and their corresponding input types/labels
const filterableColumns = [
  { key: 'name', label: 'Filter by Name', type: 'text' },
  { key: 'manufacturer', label: 'Filter by Manufacturer', type: 'text' },
  { key: 'saltComposition', label: 'Filter by Salt Composition', type: 'text' },
  { key: 'expiryDate', label: 'Filter by Expiry Date', type: 'date' }, // Using type 'date' for potential date picker
  // Add other filterable columns here
];

function ProductsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Keep limit constant for simplicity in this example

  const router = useRouter();
  const searchParams = useSearchParams(); // Initialize useSearchParams

  // Initialize state from URL query parameters on mount
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSearchTerm = searchParams.get('search') || '';
  const initialFilters: FilterState = {};
  // Dynamically initialize filters from URL params
  filterableColumns.forEach(col => {
    const paramValue = searchParams.get(col.key);
    if (paramValue !== null) {
      initialFilters[col.key as keyof FilterState] = paramValue;
    }
  });
  const initialSortBy = searchParams.get('sortBy');
  const initialSortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
  const initialSortConfig = (initialSortBy && initialSortOrder) ? { key: initialSortBy as keyof Medicine, direction: initialSortOrder } : null;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSortConfig);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);

  // Use a ref to track if the effect has run its initial pass
  const effectRan = useRef(false);

  // State for custom confirm dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [medicineToDeleteId, setMedicineToDeleteId] = useState<string | null>(null);

  // Function to open the confirm dialog
  const openConfirmDialog = (medicineId: string) => {
    setMedicineToDeleteId(medicineId);
    setIsConfirmDialogOpen(true);
  };

  // Function to close the confirm dialog
  const closeConfirmDialog = () => {
    setMedicineToDeleteId(null);
    setIsConfirmDialogOpen(false);
  };

  // Define the fetch function outside useEffect
  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build params object from state for API call
      const params: any = { // Use any for now or build a proper type if needed for the API call
        page: currentPage,
        limit: limit,
        ...(sortConfig && { sortBy: sortConfig.key, sortOrder: sortConfig.direction }),
        ...(searchTerm && { search: searchTerm }),
        ...filters, // Spread the filters state directly
      };

      // Clean up params by removing empty filter values before API call
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await getMedicines(params);
      setMedicines(data.medicines);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch medicines.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to sync state with URL and fetch data
  useEffect(() => {
    // Function to update URL based on current state
    const updateUrl = () => {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      Object.keys(filters).forEach(key => {
        const filterValue = filters[key as keyof FilterState];
        if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
          params.set(key, filterValue);
        }
      });
      if (sortConfig) {
        params.set('sortBy', sortConfig.key as string);
        params.set('sortOrder', sortConfig.direction);
      }
      router.replace(`?${params.toString()}`);
    };

    // Sync URL and fetch data when relevant state changes, preventing initial Strict Mode double run
    if (!effectRan.current) {
      effectRan.current = true;
      // On initial mount, state is already set from URL, just fetch data
      if (initialPage === currentPage && initialSearchTerm === searchTerm && JSON.stringify(initialFilters) === JSON.stringify(filters) && JSON.stringify(initialSortConfig) === JSON.stringify(sortConfig)) {
        fetchMedicines();
      } else {
        // If initial state from URL somehow doesn't match current state (shouldn't happen with correct init), sync URL and then fetch
        updateUrl();
        fetchMedicines();
      }
      return;
    }

    // On subsequent renders triggered by state changes, update URL and fetch data
    updateUrl();
    fetchMedicines();

  }, [currentPage, limit, sortConfig, filters, searchTerm]); // Dependencies trigger sync and fetch

  const handleSort = (key: keyof Medicine) => {
    let direction: SortConfig['direction'] = 'asc';
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        // If already descending, reset sorting
        setSortConfig(null);
        setCurrentPage(1); // Reset to first page
        return;
      }
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  const handleReset = () => {
    setCurrentPage(1);
    setSortConfig(null);
    setFilters({}); // Reset filters
    setSearchTerm(''); // Reset search term
  };

  // Function to handle medicine deletion
  const handleDeleteMedicine = async (id: string) => {
    setLoading(true); // Optional: show loading state during deletion
    try {
      await deleteMedicine(id);
      toast.success('Medicine deleted successfully!');
      // Refresh the list after successful deletion
      // Since fetchMedicines depends on state (currentPage, filters, etc.),
      // updating the state will trigger a re-fetch automatically via useEffect.
      // If the deleted item was the only one on the current page and not the first page,
      // we might need to go back to the previous page.
      // A simple approach for now is to just refetch the current page,
      // which will show fewer items or an empty state if it was the last item.
      // A more robust approach would check the totalCount after deletion and adjust currentPage if needed.
      // For simplicity, triggering a re-fetch by updating a dummy state or re-calling fetchMedicines
      // within the useEffect dependency array might be an option, but relying on
      // existing state dependencies is cleaner if it works.
      // Let's trigger a refetch by potentially adjusting the page or just relying on the existing useEffect dependencies.
      // A simple way to force a re-fetch if needed, while respecting current filters/sorting,
      // is to re-call fetchMedicines. However, the useEffect will handle this if state changes.
      // If deleting the last item on a page, the totalPages might decrease, and if we were on the last page,
      // currentPage might become invalid. A better approach is to refetch and then adjust currentPage if necessary.
      // For now, let's just rely on the existing useEffect structure which will refetch the current page.
      // If the current page becomes empty after deletion, the fetchMedicines call will handle it.
      fetchMedicines(); // Call fetchMedicines again to refresh the list
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      toast.error(error.message || 'Failed to delete medicine.');
    } finally {
      setLoading(false); // Optional: hide loading state
    }
  };

  // Function called when confirming deletion in the custom dialog
  const handleConfirmDelete = async () => {
    if (medicineToDeleteId) {
      await handleDeleteMedicine(medicineToDeleteId);
    }
    closeConfirmDialog(); // Close the dialog after action
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <Button onClick={() => router.push('/medicines/add')} className="bg-sky-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">Add Medicine</Button>
      </div>

      {loading && <p>Loading medicines...</p>}

      {/* Conditional rendering based on error state */}
      {error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-600">No data found.</p>
        </div>
      ) : (
        <>
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
                  placeholder={filterCol.label}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                />
              </div>
            ))}
          </div>

          {/* Table and Pagination - only show if no error and not loading */}
          {!loading && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[ // Table columns based on your request
                        { key: 'actions', label: 'Actions' },
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
                      <TableRow
                        key={medicine._id}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <TableCell className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/medicines/edit/${medicine._id}`);
                          }}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            openConfirmDialog(medicine._id); // Open custom dialog instead of default confirm
                          }}>Delete</Button>
                        </TableCell>
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
        </>
      )}

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        message="Are you sure you want to delete this medicine?"
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirmDialog}
      />
    </div>
  );
}

export default withAuthGuard(ProductsPage); // Export the component wrapped with the HOC
