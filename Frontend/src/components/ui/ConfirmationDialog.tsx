"use client"

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmVariant?: "default" | "destructive";
    confirmText?: string;
    cancelText?: string;
    requireConfirmationText?: string;
    confirmationPlaceholder?: string;
    onConfirmationTextChange?: (text: string) => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onCancel,
    onConfirm,
    title,
    message,
    confirmVariant = "default",
    confirmText = "Confirm",
    cancelText = "Cancel",
    requireConfirmationText,
    confirmationPlaceholder,
    onConfirmationTextChange
}) => {
    const [confirmationInput, setConfirmationInput] = useState("");
    const isConfirmDisabled = requireConfirmationText && confirmationInput !== requireConfirmationText;

    // Reset confirmation input when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setConfirmationInput("");
            onConfirmationTextChange?.("");
        }
    }, [isOpen, onConfirmationTextChange]);

    const handleConfirm = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (requireConfirmationText && confirmationInput !== requireConfirmationText) {
            console.log('Confirmation text does not match:', {
                required: requireConfirmationText,
                input: confirmationInput
            });
            return;
        }
        onConfirm();
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmationInput("");
        onConfirmationTextChange?.("");
        onCancel();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const value = e.target.value;
        console.log('Confirmation input changed:', {
            value,
            required: requireConfirmationText,
            matches: value === requireConfirmationText
        });
        setConfirmationInput(value);
        onConfirmationTextChange?.(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.key === 'Enter' && !isConfirmDisabled) {
            e.preventDefault();
            handleConfirm(e as any);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel(e as any);
        }
    };

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) {
                    handleCancel(new MouseEvent('click') as any);
                }
            }}
        >
            <DialogContent 
                className="bg-gray-900/95 border border-gray-700 text-white shadow-xl backdrop-blur-sm max-w-md w-full mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-red-500">{title}</DialogTitle>
                    <DialogDescription className="text-gray-300 whitespace-pre-line">{message}</DialogDescription>
                </DialogHeader>
                {requireConfirmationText && (
                    <div className="py-4">
                        <Input
                            value={confirmationInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={confirmationPlaceholder || `Type "${requireConfirmationText}" to confirm`}
                            className="w-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            autoFocus
                        />
                        {confirmationInput && confirmationInput !== requireConfirmationText && (
                            <p className="text-sm text-red-400 mt-2">
                                Text must match exactly: "{requireConfirmationText}"
                            </p>
                        )}
                    </div>
                )}
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="bg-transparent hover:bg-gray-800 text-white"
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        variant={confirmVariant} 
                        onClick={handleConfirm}
                        disabled={Boolean(isConfirmDisabled)}
                        className={`${confirmVariant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""} ${isConfirmDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 