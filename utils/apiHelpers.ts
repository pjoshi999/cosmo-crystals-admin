import { ApiError, HandleApiErrorResponse } from "@/types/error";
import { toast } from "sonner";

export const handleApiError = (error: ApiError): HandleApiErrorResponse => {
  const defaultError = {
    error: { general: ["An unexpected error occurred"] },
    toastMessage: "An unexpected error occurred",
  };

  console.error(error);

  if (!error.response) {
    toast.error("Network error occurred");
    return {
      error: { network: ["Network error occurred"] },
      toastMessage: "Network error occurred",
    };
  }

  const { data, status } = error.response;

  try {
    const errorData: Record<string, string[]> = {};

    if (typeof data === "object" && data !== null) {
      // Handle detail field
      if (data?.detail) {
        errorData.detail = [data?.detail];
      }

      if (typeof data?.error === "string") {
        toast.error(data?.error);
      }

      // Handle message field
      if (data?.message) {
        errorData.message = [data?.message];
      }

      // console.log("data", data, errorData);

      // Handle other fields
      // Object.entries(data).forEach(([key, value]) => {
      //   console.log("error array", key, value);
      //   if (key !== "detail" && key !== "message") {
      //     if (Array.isArray(value)) {
      //       errorData[0] = value && value[0].message;
      //     } else if (typeof value === "string") {
      //       errorData[key] = [value];
      //     }
      //   }
      // });

      // console.log("errorData", errorData);

      // Show toasts for each error
      // Object.entries(errorData).forEach(([, messages]) => {
      //   messages.forEach((msg) => {
      //     toast.error(`₹{msg}`);
      //   });
      // });

      if (Array.isArray(data?.error)) {
        // console.log("inside errordata array");
        data?.error.map((error) => {
          // console.log("toast error", error);
          toast.error(error?.message || error);
        });
      }

      return {
        error: Array.isArray(data?.error)
          ? data?.error.filter((e) => e !== undefined)
          : [data?.error].filter((e) => e !== undefined),
        toastMessage:
          status === 400
            ? "Please correct the errors and try again"
            : "An error occurred",
      };
    }
  } catch (e) {
    console.error("Error parsing API response:", e);
  }

  // console.log(defaultError);

  return defaultError;
};
