import toast from "react-hot-toast";

export function showSuccess(message: string): void {
  toast.success(message, {
    duration: 4000,
    position: "top-right"
  });
}

export function showError(message: string): void {
  toast.error(message, {
    duration: 5000,
    position: "top-right"
  });
}

export function showLoading(message: string): string {
  return toast.loading(message, {
    position: "top-right"
  });
}

export function dismiss(toastId?: string): void {
  if (toastId) {
    toast.dismiss(toastId);
    return;
  }

  toast.dismiss();
}

export function updateToast(
  toastId: string,
  message: string,
  type: "success" | "error"
): void {
  toast.custom(
    () => (
      <div
        className={`rounded-lg px-4 py-3 text-white ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {message}
      </div>
    ),
    { id: toastId }
  );
}
