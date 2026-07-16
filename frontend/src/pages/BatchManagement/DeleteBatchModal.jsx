import { FaExclamationTriangle } from "react-icons/fa";

const DeleteBatchModal = ({
  isOpen,
  onClose,
  onConfirm,
  batchName,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        {/* Icon */}

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">

          <FaExclamationTriangle
            className="text-red-600"
            size={28}
          />

        </div>

        {/* Title */}

        <h2 className="mt-5 text-center text-2xl font-bold text-slate-800">
          Delete Batch
        </h2>

        {/* Message */}

        <p className="mt-3 text-center text-slate-500 leading-7">

          Are you sure you want to delete

          <span className="font-semibold text-slate-700">
            {" "}
            "{batchName}"
          </span>

          ?

          <br />

          This action cannot be undone.

        </p>

        {/* Buttons */}

        <div className="mt-8 flex gap-4">

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default DeleteBatchModal;