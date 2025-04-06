"use client";
import { apiClient } from "@/api/apiClient";
import { AppSidebar } from "@/components/app-sidebar";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
// import { SectionCards } from "@/src/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useProducts } from "@/hooks/queries/useProducts";
import { queryClient } from "../QueryProvider";
import { productKeys } from "@/api/endpoints/products";
import { Loader2 } from "lucide-react";
import { handleApiError } from "@/utils/apiHelpers";
import { ApiError } from "@/types/error";

export default function Page() {
  const { data, isLoading } = useProducts();

  console.log(data);

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);

      if (response && response.data) {
        toast.success(
          response?.data?.message || "Product deleted successfully"
        );
        // This will trigger a refetch of products
        await queryClient.invalidateQueries({ queryKey: productKeys.list({}) });
      }
    } catch (error) {
      // toast.error("Failed to delete product");
      handleApiError(error as ApiError);
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading products...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}
              <DataTable
                data={data?.products || []}
                handleDeleteProduct={handleDeleteProduct}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
