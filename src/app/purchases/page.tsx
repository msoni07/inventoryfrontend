'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { api } from '@/services/authService'; // Corrected import path for the api instance
import { debounce } from '@/utils'; // Import the debounce utility from the new file

// Define a simple type for the user object
interface User {
  username?: string;
  // Add other properties of the user object if needed for type safety
  [key: string]: any; // Allow other properties
}

// Define a type for bill items for better type safety
interface BillItem {
  id: number;
  product: string;
  batch: string;
  tab: number;
  mrp: number;
  gstPercentage: number; // Keep gstPercentage from API
  dis1Percent: number; // Use dis1Percent for editable discount
  amount: number;
  gstAmount: number;
}

export default function CreateBillPage() {
  const [billDetails, setBillDetails] = useState({
    billNo: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    patientName: '',
    address: '',
  });

  const [items, setItems] = useState<BillItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<BillItem, 'id' | 'amount' | 'pack' | 'stri'>>({
    product: '',
    batch: '',
    tab: 1, // Default Tab to 1
    mrp: 0,
    gstPercentage: 0, // Initialize gstPercentage
    dis1Percent: 0, // Initialize dis1Percent
    gstAmount: 0, // Initialize gstAmount
  });

  // State for product search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Define a proper type for search results later
  const [showSuggestions, setShowSuggestions] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user as User | null | undefined);

  // Basic handler for bill detail inputs
  const handleBillDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce(async (value: string) => {
      try {
        const response = await api.get(`/inventory/medicines`, {
          params: { search: value, limit: 10 } // Limit results for suggestions
        });
        setSearchResults(response.data.medicines || []);
        setShowSuggestions(response.data.medicines.length > 0); // Show suggestions only if there are results
      } catch (error) {
        console.error('Error searching medicines:', error);
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 500), // 500ms debounce delay
    [] // Dependency array is empty as api is stable
  );

  // Handle new item input change, including product search
  const handleNewItemChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle product input separately as it's a string
    if (name === 'product') {
      setNewItem(prevItem => ({ ...prevItem, [name]: value }));
      setSearchTerm(value);
      // Call the debounced search function
      if (value.length > 0) {
        debouncedSearch(value);
      } else {
        // Clear results and hide suggestions if input is empty
        setSearchResults([]);
        setShowSuggestions(false);
        // Clear any pending debounced calls if input is cleared
        debouncedSearch.cancel();
      }
      return; // Exit the function after handling product input
    }

    // For other numeric inputs, parse the value
    const floatValue = parseFloat(value) || 0;
    const updatedItem = { ...newItem, [name]: floatValue };

    // Update newItem state with the changed value
    setNewItem(updatedItem);

    // Recalculate amount and gstAmount if tab, mrp, dis1Percent, or gstPercentage changes
    if (name === 'tab' || name === 'mrp' || name === 'dis1Percent' || name === 'gstPercentage') {
      const quantity = updatedItem.tab;
      const mrp = updatedItem.mrp;
      const gstPercent = updatedItem.gstPercentage; // Use the stored gstPercentage
      const discountPercent = updatedItem.dis1Percent; // Use the dis1Percent value

      const priceBeforeDiscount = quantity * mrp;
      const priceAfterDiscount = priceBeforeDiscount * (1 - discountPercent / 100);
      const calculatedGstAmount = priceAfterDiscount * (gstPercent / 100);
      const calculatedAmount = priceAfterDiscount + calculatedGstAmount;

      setNewItem(prevItem => ({
        ...prevItem,
        amount: parseFloat(calculatedAmount.toFixed(2)),
        gstAmount: parseFloat(calculatedGstAmount.toFixed(2))
      }));
    }
  };

  // Handle selection of a product from suggestions
  const handleSelectProduct = (product: any) => { // Define a proper type for product later
    const quantity = 1; // Default Tab is 1 on selection
    const mrp = product.mrp || 0;
    const gstPercent = product.gstPercentage || 0; // Use gstPercentage from product
    const discountPercent = product.discount || 0; // Use discount from product, default to 0 if not available

    const priceBeforeDiscount = quantity * mrp;
    const priceAfterDiscount = priceBeforeDiscount * (1 - discountPercent / 100);
    const calculatedGstAmount = priceAfterDiscount * (gstPercent / 100);
    const calculatedAmount = priceAfterDiscount + calculatedGstAmount;

    setNewItem({
      product: product.name,
      batch: product.batchNumber || '',
      tab: 1, // Keep Tab default as 1 on selection
      mrp: mrp, // Populated from search result, made non-editable
      gstPercentage: gstPercent, // Set gstPercentage from product
      dis1Percent: discountPercent, // Set dis1Percent from product.discount
      gstAmount: parseFloat(calculatedGstAmount.toFixed(2)), // Calculate and set gstAmount
      // No need to set 'amount' here, it will be calculated in handleNewItemChange if needed or when adding
    });
    // Explicitly update the input value
    // const productInput = document.querySelector('input[name="product"]') as HTMLInputElement;
    // if (productInput) {
    //   productInput.value = product.name;
    // }
    setSearchTerm(product.name); // Keep the selected product name in the input
    setShowSuggestions(false); // Hide suggestions
    setSearchResults([]); // Clear search results
  };

  // Function to add a new item to the table
  const handleAddItem = () => {
    // Basic validation - Updated validation to check tab instead of stri and tab
    if (!newItem.product || newItem.mrp <= 0 || newItem.tab <= 0) {
      alert('Please fill in product, MRP, and quantity (tab).');
      return;
    }

    // Calculate amount and gstAmount
    const quantity = newItem.tab;
    const mrp = newItem.mrp;
    const gstPercent = newItem.gstPercentage;
    const discountPercent = newItem.dis1Percent;

    const priceBeforeDiscount = quantity * mrp;
    const priceAfterDiscount = priceBeforeDiscount * (1 - discountPercent / 100);
    const calculatedGstAmount = priceAfterDiscount * (gstPercent / 100);
    const calculatedAmount = priceAfterDiscount + calculatedGstAmount;


    const itemToAdd: BillItem = {
      id: Date.now(), // Simple unique ID
      product: newItem.product,
      batch: newItem.batch,
      tab: newItem.tab,
      mrp: newItem.mrp,
      gstPercentage: newItem.gstPercentage, // Use gstPercentage
      dis1Percent: newItem.dis1Percent, // Use dis1Percent
      amount: parseFloat(calculatedAmount.toFixed(2)), // Format amount to 2 decimal places
      gstAmount: parseFloat(calculatedGstAmount.toFixed(2)), // Calculate and add gstAmount
    };

    setItems(prevItems => [...prevItems, itemToAdd]);
    // Reset new item form - Updated reset state
    setNewItem({
      product: '',
      batch: '',
      tab: 1,
      mrp: 0,
      gstPercentage: 0,
      dis1Percent: 0,
      gstAmount: 0,
    });
    setSearchTerm(''); // Clear search term after adding item
  };

  // Handle input change for items in the table
  const handleItemInputChange = (id: number, name: keyof BillItem, value: string) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [name]: parseFloat(value) || 0 };
          // Recalculate amount and gstAmount for the updated item based on all relevant fields
          const quantity = updatedItem.tab;
          const mrp = updatedItem.mrp;
          const gstPercent = updatedItem.gstPercentage; // Use the stored gstPercentage
          const discountPercent = updatedItem.dis1Percent; // Use the updated or stored dis1Percent

          const priceBeforeDiscount = quantity * mrp;
          const priceAfterDiscount = priceBeforeDiscount * (1 - discountPercent / 100);
          const calculatedGstAmount = priceAfterDiscount * (gstPercent / 100);
          const calculatedAmount = priceAfterDiscount + calculatedGstAmount;

          return {
            ...updatedItem,
            amount: parseFloat(calculatedAmount.toFixed(2)),
            gstAmount: parseFloat(calculatedGstAmount.toFixed(2)) // Recalculate gstAmount
          };
        }
        return item;
      })
    );
  };

  // Handle deleting an item from the table
  const handleDeleteItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Calculate totals (simplified for now)
  const billTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalGstAmount = items.reduce((sum, item) => sum + item.gstAmount, 0); // Calculate total GST amount

  // Calculate total Tab
  const totalTab = items.reduce((sum, item) => sum + item.tab, 0);

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Header and Bill Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Adjusted grid for bill details to have 3 columns on medium and larger screens */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Removed Party Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Bill No:</label>
              <input type="text" name="billNo" value={billDetails.billNo} onChange={handleBillDetailChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            {/* Made Date non-editable and display current date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date:</label>
              <input type="date" name="date" value={billDetails.date} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Doctor:</label>
              <input type="text" name="doctor" value={billDetails.doctor} onChange={handleBillDetailChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name:</label>
              <input type="text" name="patientName" value={billDetails.patientName} onChange={handleBillDetailChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address:</label>
              <input type="text" name="address" value={billDetails.address} onChange={handleBillDetailChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            {/* Removed Reg.No Input */}
          </div>
          {/* Placeholder for additional info section on the right */}
          <div className="md:col-span-1 bg-gray-50 p-4 rounded-md text-sm">
            <h3 className="font-semibold mb-2">Bill Information:</h3>
            {/* Assuming user data is in Redux state */}
            <p>Created By: {user?.username || 'N/A'}</p>
            <p>Printed By: {user?.username || 'N/A'}</p>
            {/* Add more relevant bill info fields here */}
          </div>
        </div>

        {/* Item Entry Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Item:</h2>
          {/* Adjusted grid for item inputs - Added GST Amount field */}
          {/* Changed grid to md:grid-cols-7 to accommodate GST Amount */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-end">
            {/* Input fields for new item */}
            {/* Increased span for product search */}
            <div className="relative col-span-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <input type="text" name="product" value={newItem.product} onChange={handleNewItemChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" autoComplete="off" onBlur={() => setShowSuggestions(false)} onFocus={() => searchTerm.length > 0 && searchResults.length > 0 && setShowSuggestions(true)} />
              {showSuggestions && searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <li
                      key={result._id}
                      onMouseDown={() => handleSelectProduct(result)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      {result.name} ({result.batchNumber} - Rs.{result.mrp.toFixed(2)}) {/* Display relevant product info */}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Removed Pack Input */}
            {/* Removed Stri Input */}
            {/* Batch Input - Made non-editable */}
            {/* Removed Batch Input field */}
            {/* Tab Input - Defaulted to 1 */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Tab</label>
              <input type="number" name="tab" value={newItem.tab} onChange={handleNewItemChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            {/* MRP/S Input - Made non-editable */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">MRP/S</label>
              <input type="number" name="mrp" value={newItem.mrp} onChange={handleNewItemChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly disabled />
            </div>
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">GST %</label>
              <input type="number" name="gstPercentage" value={newItem.gstPercentage} onChange={handleNewItemChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly disabled /> {/* Changed label to GST % */}
            </div>
            {/* Added GST Amount field - Made non-editable and light grey */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">GST Amount</label>
              {/* Display calculated GST amount from newItem state */}
              <input type="number" name="gstAmount" value={newItem.gstAmount || 0} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly disabled />{/* Display calculated GST amount, non-editable */}
            </div>
            {/* Changed label to Dis1% and name to dis1Percent, removed Discount field */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Dis1%</label>
              <input type="number" name="dis1Percent" value={newItem.dis1Percent} onChange={handleNewItemChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /> {/* Changed name to dis1Percent */}
            </div>
            <div className="col-span-2 md:col-span-1 flex items-end">
              <button onClick={handleAddItem} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">Add Item</button>
            </div>
          </div>
        </div>

        {/* Items Table Display - Conditionally render based on items existence */}
        {items.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Bill Items:</h2>
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Sr.</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Batch</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Tab</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">M.R.P./S</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">GST %</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">GST Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Dis1%</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.product}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.batch}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <input
                        type="number"
                        value={item.tab}
                        onChange={(e) => handleItemInputChange(item.id, 'tab', e.target.value)}
                        className="w-16 border border-gray-300 rounded-md shadow-sm p-1 text-right"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{item.mrp.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{item.gstPercentage.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{item.gstAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <input
                        type="number"
                        value={item.dis1Percent}
                        onChange={(e) => handleItemInputChange(item.id, 'dis1Percent', e.target.value)}
                        className="w-16 border border-gray-300 rounded-md shadow-sm p-1 text-right"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{item.amount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button onClick={() => handleDeleteItem(item.id)} className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bill Summary and Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: Bill Totals */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Bill Levies:</h2>
            <div className="space-y-2">
              <p className="text-sm flex justify-between"><span>BILL TOTAL:</span><span className="font-bold">{billTotal.toFixed(2)}</span></p>
              <p className="text-sm flex justify-between"><span>TOTAL GST AMOUNT:</span><span className="font-bold">{totalGstAmount.toFixed(2)}</span></p>
              {/* Add Cash Received and Balance inputs later */}
              <p className="text-sm flex justify-between"><span>CASH RECEIVED:</span><span>[Input]</span></p>
              <p className="text-sm flex justify-between"><span>BALANCE:</span><span>[Calculated]</span></p>
            </div>
          </div>

          {/* Right side: Item Details Summary / Other Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Item Details:</h2>
            {/* This section needs dynamic calculation and display */}
            <div className="text-sm space-y-1">
              <p>MRP Value: [Calculated]</p>
              <p>VALUE OF GOODS: [Calculated]</p>
              <p>DIS.10%: [Calculated]</p>
              <p>DIS: [Calculated]</p>
              <p>Disc.(%): [Calculated]</p>
              <p>CGST: [Calculated]</p>
              <p>SGST: [Calculated]</p>
              <p>Balance: [Calculated]</p>
              <p>BRK/EXP/REPL. A/: [Info]</p>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="mt-6 flex space-x-2 justify-center flex-wrap">
          {/* Add Buttons here */}
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Next</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Modify</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Print</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Delete</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Cancel</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">View</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Amend Detail</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Email</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Exit</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Previous</button>
          <button className="px-4 py-2 bg-gray-300 rounded-md text-sm">Courier</button>
        </div>

        {/* Bottom Totals/Info */}
        <div className="mt-6 flex justify-between items-center text-base font-bold border-t pt-4">
          <div>
            <span>TAB: {totalTab}</span>{/* Display total Tab */}
          </div>
          <div>
            <span>Invoice Value: {billTotal.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
