"use client";

import { deleteAccountAction } from "@/src/actions/auth";
import { OctagonAlert, Trash, TriangleAlert } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountAction();
      toast.success("Account deleted successfully.");
    } catch (error) {
      console.error("Failed to delete account:", error);
      setIsDeleting(false);
      setShowConfirm(false);
      toast.error("Failed to delete account. Please try again.");
      return;
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="border-5 border-red-500 bg-black rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <h2 className="flex flex-row gap-2 justify-center items-center text-lg font-semibold mb-4 text-red-600">
            Confirm Account Deletion <TriangleAlert />{" "}
          </h2>
          <p className="mb-6 text-white">
            Are you sure you want to delete your account and all associated
            data? This action cannot be undone, and will be instant.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              <OctagonAlert className="inline mr-2" />
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleDeleteClick}
      className="flex items-center border border-red-500 text-red-400 py-2 px-4 rounded-4xl cursor-pointer hover:bg-red-900 hover:text-white transition-colors"
    >
      <Trash className="inline mr-2 text-red-500" />
      Delete Account & Data
    </button>
  );
}
