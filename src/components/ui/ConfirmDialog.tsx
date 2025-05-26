'use client';

import React from 'react';
import { Button } from './button'; // Assuming Button component is in the same directory

interface ConfirmDialogProps {
    message: string;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    message,
    isOpen,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="mb-4 text-gray-800">{message}</p>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog; 