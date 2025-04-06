"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash, Plus, Upload, X, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCategory } from "@/hooks/queries/useCategories";
import { Category, SubCategory } from "@/types";
import { apiClient } from "@/api/apiClient";
import { use } from "react";
import { useProduct } from "@/hooks/queries/useProducts";
import { handleApiError } from "@/utils/apiHelpers";
import { ApiError } from "@/types/error";

// Define product data types
interface ProductImage {
  id?: string; // Make id optional since new uploads won't have IDs yet
  url: string;
  alt: string;
  isMain: boolean;
  productId?: string; // Make this optional for the same reason
  createdAt?: string; // Optional fields from API
  updatedAt?: string;
  cartItemId?: string | null;
}

// Define form validation schema
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  price: z.number().min(0, "Price cannot be negative"),
  salePrice: z.number().min(0, "Sale price cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().min(1, "Subcategory is required"),
  images: z
    .array(
      z.object({
        id: z.string().optional(), // Make ID optional
        url: z.string(),
        alt: z.string(),
        isMain: z.boolean(),
        productId: z.string().optional(), // Make productId optional
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        cartItemId: z.string().nullable().optional(),
      })
    )
    .min(1, "At least one product image is required"),
  attributes: z.array(
    z
      .object({
        name: z.string().optional(),
        value: z.string().optional(),
      })
      .optional()
  ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Function to upload image to Cloudinary
const uploadToCloudinary = async (
  file: File
): Promise<{ id: string; url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
  );

  try {
    const response = await apiClient.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response && response?.data) {
      return {
        id: response?.data?.public_id,
        url: response?.data?.secure_url,
      };
    }

    throw new Error("Upload failed");
  } catch (error) {
    // console.error("Cloudinary upload error:", error);
    handleApiError(error as ApiError);
    throw error;
  }
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: categoryData } = useCategory();
  const { data: productData, isLoading } = useProduct(slug);

  // Image upload state
  interface UploadingImage {
    file: File;
    tempId: string;
    progress: number;
    error?: boolean;
    errorMessage?: string;
  }

  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [subCategoryRequired, setSubCategoryRequired] = useState(false);

  // Initialize the form with default empty values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      stock: 0,
      price: 0,
      salePrice: 0,
      categoryId: "",
      subCategoryId: "",
      images: [],
      attributes: [], // Initialize with one empty attribute
    },
    mode: "onChange",
  });

  // Update form values when product data is loaded
  useEffect(() => {
    if (productData) {
      // Ensure images array is properly formatted
      const formattedImages = productData.images.map((img: ProductImage) => ({
        id: img.id || "",
        url: img.url || "",
        alt: img.alt || "",
        isMain: Boolean(img.isMain),
        productId: img.productId,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
        cartItemId: img.cartItemId,
      }));

      // Ensure at least one main image is set
      if (
        !formattedImages.some((img: ProductImage) => img.isMain) &&
        formattedImages.length > 0
      ) {
        formattedImages[0].isMain = true;
      }

      // Make sure we have at least one attribute (empty if none exist)
      const formattedAttributes =
        productData.attributes && productData.attributes.length > 0
          ? productData.attributes
          : [];

      form.reset({
        name: productData.name || "",
        description: productData.description || "",
        stock: productData.stock || 0,
        price: productData.price || 0,
        salePrice: productData.salePrice || 0,
        categoryId: productData.categoryId || "",
        subCategoryId: productData.subCategoryId || "",
        images: formattedImages || [],
        attributes: formattedAttributes || [],
      });
    }
  }, [productData, form]);

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  // Watch form values for dynamic calculations
  const formValues = watch();
  const discountPercentage =
    formValues.price > 0
      ? Math.round((1 - formValues.salePrice / formValues.price) * 100)
      : 0;

  // Dropzone configuration for image uploads
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validate that Cloudinary environment variables are set
      if (
        !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      ) {
        toast.error(
          "Cloudinary configuration is missing. Please check environment variables."
        );
        return;
      }

      // Add files to uploading state with temporary IDs
      const newUploadingImages: UploadingImage[] = acceptedFiles.map(
        (file) => ({
          file,
          tempId: crypto.randomUUID(),
          progress: 0,
        })
      );

      setUploadingImages([...uploadingImages, ...newUploadingImages]);
      setIsUploading(true);

      // Process each file for upload
      for (const fileObj of newUploadingImages) {
        try {
          // Start progress updates
          const progressInterval = setInterval(() => {
            setUploadingImages((prev) =>
              prev.map((img) =>
                img.tempId === fileObj.tempId
                  ? { ...img, progress: Math.min(img.progress + 5, 95) }
                  : img
              )
            );
          }, 200);

          // Upload to Cloudinary
          const cloudinaryResponse = await uploadToCloudinary(fileObj.file);

          // Clear interval and set progress to 100%
          clearInterval(progressInterval);
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.tempId === fileObj.tempId ? { ...img, progress: 100 } : img
            )
          );

          // Add the uploaded image to form data
          const currentImages = form.getValues("images") || [];
          const newImage: ProductImage = {
            id: cloudinaryResponse.id,
            url: cloudinaryResponse.url,
            alt: fileObj.file.name,
            isMain: currentImages.length === 0, // First image becomes main by default
          };

          setValue("images", [...currentImages, newImage], {
            shouldValidate: true,
            shouldDirty: true,
          });

          // Remove from uploading list after a short delay to show 100% complete
          setTimeout(() => {
            setUploadingImages((prev) =>
              prev.filter((img) => img.tempId !== fileObj.tempId)
            );
          }, 800);
        } catch (error) {
          console.error("Image upload failed:", error);
          // Update the uploading state to reflect error
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.tempId === fileObj.tempId
                ? {
                    ...img,
                    error: true,
                    errorMessage:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : img
            )
          );
        }
      }

      // Check if all uploads are complete
      setTimeout(() => {
        if (uploadingImages.length === 0) {
          setIsUploading(false);
        }
      }, 1000);
    },
    [uploadingImages, form, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = (index: number) => {
    const currentImages = [...form.getValues("images")];

    // Check if we need to set a new main image
    const wasMain = currentImages[index].isMain;
    currentImages.splice(index, 1);

    // If we removed the main image and have other images, make the first one main
    if (wasMain && currentImages.length > 0) {
      currentImages[0].isMain = true;
    }

    setValue("images", currentImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const setMainImage = (index: number) => {
    const currentImages = [...form.getValues("images")];

    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));

    setValue("images", updatedImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateImageAlt = (index: number, alt: string) => {
    const currentImages = [...form.getValues("images")];
    currentImages[index].alt = alt;

    setValue("images", currentImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const cancelUpload = (tempId: string) => {
    setUploadingImages((prev) => prev.filter((img) => img.tempId !== tempId));

    if (uploadingImages.length <= 1) {
      setIsUploading(false);
    }
  };

  const addAttribute = () => {
    const currentAttributes = form.getValues("attributes") || [];

    setValue(
      "attributes",
      [
        ...currentAttributes,
        {
          name: "",
          value: "",
        },
      ],
      {
        shouldDirty: true,
      }
    );
  };

  const removeAttribute = (index: number) => {
    const currentAttributes = [...form.getValues("attributes")];

    if (currentAttributes.length > 1) {
      currentAttributes.splice(index, 1);
      setValue("attributes", currentAttributes, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const updateAttributeName = (index: number, name: string) => {
    const currentAttributes = [...form.getValues("attributes")];
    if (currentAttributes[index]) {
      currentAttributes[index].name = name;
    }

    setValue("attributes", currentAttributes, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateAttributeValue = (index: number, value: string) => {
    const currentAttributes = [...form.getValues("attributes")];
    if (currentAttributes[index]) {
      currentAttributes[index].value = value;
    }

    setValue("attributes", currentAttributes, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCategoryChange = (value: string) => {
    setValue("categoryId", value, { shouldValidate: true });
    setValue("subCategoryId", "", { shouldValidate: true }); // Reset subcategory when category changes
    setSubCategoryRequired(true); // Mark that subcategory needs to be updated
  };

  // Handle form submission for updating the product
  const onSubmit = async (data: ProductFormValues) => {
    try {
      // Validation: Check if subcategory needs to be updated after category change
      if (
        subCategoryRequired &&
        data.subCategoryId === productData?.subCategoryId
      ) {
        toast.error(
          "You changed the category. Please select a new subcategory."
        );
        return;
      }

      const changedFields: Partial<ProductFormValues> = {};

      // Compare current form values with original data
      if (data.name !== form.formState.defaultValues?.name)
        changedFields.name = data.name;
      if (data.description !== form.formState.defaultValues?.description)
        changedFields.description = data.description;
      if (data.stock !== form.formState.defaultValues?.stock)
        changedFields.stock = data.stock;
      if (data.price !== form.formState.defaultValues?.price)
        changedFields.price = data.price;
      if (data.salePrice !== form.formState.defaultValues?.salePrice)
        changedFields.salePrice = data.salePrice;
      if (data.categoryId !== form.formState.defaultValues?.categoryId)
        changedFields.categoryId = data.categoryId;
      if (data.subCategoryId !== form.formState.defaultValues?.subCategoryId)
        changedFields.subCategoryId = data.subCategoryId;

      // For images and attributes, we need deeper comparison
      if (
        JSON.stringify(data.images) !==
        JSON.stringify(form.formState.defaultValues?.images)
      ) {
        changedFields.images = data.images;
      }

      if (
        JSON.stringify(data.attributes) !==
        JSON.stringify(form.formState.defaultValues?.attributes)
      ) {
        changedFields.attributes = data.attributes;
      }

      console.log("Updating product with changed fields:", changedFields);

      const response = await apiClient.patch(
        `/products/${slug}`,
        changedFields
      );

      if (response && response.data) {
        toast.success("Product updated successfully!");
        router.push("/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      // toast.error("Failed to update product. Please try again.");
      handleApiError(error as ApiError);
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
            <span className="ml-2">Loading product data...</span>
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
              <div className="w-full max-w-6xl mx-auto p-4">
                <FormProvider {...form}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Card className="w-full shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold">
                          Edit Product
                        </CardTitle>
                        <CardDescription>
                          Update your product details
                        </CardDescription>
                      </CardHeader>

                      <Tabs defaultValue="basic" className="w-full">
                        <div className="px-6 pt-4">
                          <TabsList className="grid grid-cols-4 gap-4">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                            <TabsTrigger value="attributes">
                              Attributes
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <CardContent className="p-6">
                          <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              <FormItem>
                                <FormLabel>Product Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter product name"
                                    {...form.register("name")}
                                  />
                                </FormControl>
                                {errors.name && (
                                  <FormMessage>
                                    {errors.name.message}
                                  </FormMessage>
                                )}
                              </FormItem>

                              <FormItem>
                                <FormLabel>Stock Quantity *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Available stock"
                                    min={0}
                                    {...form.register("stock", {
                                      valueAsNumber: true,
                                    })}
                                  />
                                </FormControl>
                                {errors.stock && (
                                  <FormMessage>
                                    {errors.stock.message}
                                  </FormMessage>
                                )}
                              </FormItem>
                            </div>

                            <FormItem>
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter product description"
                                  className="min-h-32"
                                  {...form.register("description")}
                                />
                              </FormControl>
                              {errors.description && (
                                <FormMessage>
                                  {errors.description.message}
                                </FormMessage>
                              )}
                            </FormItem>

                            <div className="grid md:grid-cols-2 gap-6">
                              <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select
                                  value={formValues.categoryId}
                                  onValueChange={handleCategoryChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categoryData?.categories?.map(
                                      (category: Category) => (
                                        <SelectItem
                                          key={category.id}
                                          value={category.id}
                                        >
                                          {category.name}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                {errors.categoryId && (
                                  <FormMessage>
                                    {errors.categoryId.message}
                                  </FormMessage>
                                )}
                              </FormItem>

                              <FormItem>
                                <FormLabel>Subcategory *</FormLabel>
                                <Select
                                  value={formValues.subCategoryId}
                                  onValueChange={(value) => {
                                    setValue("subCategoryId", value, {
                                      shouldValidate: true,
                                    });
                                    // Clear the requirement flag once a new subcategory is selected
                                    if (subCategoryRequired) {
                                      setSubCategoryRequired(false);
                                    }
                                  }}
                                  disabled={!formValues.categoryId}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select subcategory" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {formValues.categoryId &&
                                      categoryData?.categories
                                        ?.find(
                                          (category: Category) =>
                                            category.id ===
                                            formValues.categoryId
                                        )
                                        ?.subCategory?.map(
                                          (subcategory: SubCategory) => (
                                            <SelectItem
                                              key={subcategory.id}
                                              value={subcategory.id}
                                            >
                                              {subcategory.name}
                                            </SelectItem>
                                          )
                                        )}
                                  </SelectContent>
                                </Select>
                                {(errors.subCategoryId ||
                                  subCategoryRequired) && (
                                  <FormMessage>
                                    {subCategoryRequired
                                      ? "You changed the category. Please select a new subcategory."
                                      : errors.subCategoryId?.message}
                                  </FormMessage>
                                )}
                              </FormItem>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="images"
                            className="space-y-4 mt-4"
                          >
                            <div className="mb-6">
                              <h3 className="text-lg font-medium mb-3">
                                Product Images *
                              </h3>

                              {/* Dropzone for image upload */}
                              <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                  isDragActive
                                    ? "border-blue-500 bg-blue-50"
                                    : errors.images
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-sm text-center">
                                  Drag & drop images here, or click to select
                                  files
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Supported formats: JPG, PNG, GIF (Max: 10MB)
                                </p>
                                {errors.images && (
                                  <p className="text-red-500 text-sm mt-2">
                                    {errors.images.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Currently uploading images */}
                            {uploadingImages.length > 0 && (
                              <div className="space-y-2 mt-4 mb-6">
                                <h4 className="text-sm font-medium">
                                  Uploading...
                                </h4>
                                {uploadingImages.map((img) => (
                                  <div
                                    key={img.tempId}
                                    className="flex items-center p-2 border rounded"
                                  >
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                                      {img.error ? (
                                        <X className="h-6 w-6 text-red-500" />
                                      ) : (
                                        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm truncate max-w-xs">
                                        {img.file.name}
                                      </p>
                                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div
                                          className={`h-2 rounded-full ${
                                            img.error
                                              ? "bg-red-500"
                                              : "bg-blue-500"
                                          }`}
                                          style={{ width: `${img.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => cancelUpload(img.tempId)}
                                      className="ml-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Existing images grid */}
                            {formValues.images &&
                            formValues.images.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formValues.images.map((image, index) => (
                                  <div
                                    key={index}
                                    className="border rounded-lg p-4"
                                  >
                                    <div className="grid grid-cols-[100px,1fr] gap-4">
                                      <div className="flex items-center justify-center rounded-lg h-24 bg-gray-50">
                                        <Image
                                          src={image.url}
                                          alt="Product image"
                                          className="max-h-24 max-w-full object-contain"
                                          width={100}
                                          height={100}
                                        />
                                      </div>

                                      <div className="space-y-3">
                                        <div className="flex justify-between">
                                          <FormItem className="flex items-center space-x-2">
                                            <Switch
                                              id={`main-${index}`}
                                              checked={image.isMain}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  setMainImage(index);
                                                }
                                              }}
                                            />
                                            <FormLabel
                                              htmlFor={`main-${index}`}
                                            >
                                              Main Image
                                            </FormLabel>
                                          </FormItem>

                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeImage(index)}
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        <FormItem>
                                          <FormLabel>Alt Text *</FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder="Image description for accessibility"
                                              value={image.alt}
                                              onChange={(e) =>
                                                updateImageAlt(
                                                  index,
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </FormControl>
                                        </FormItem>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                No images added yet. Please upload at least one
                                image.
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent
                            value="pricing"
                            className="space-y-4 mt-4"
                          >
                            <div className="grid md:grid-cols-2 items-start gap-6">
                              <FormItem>
                                <FormLabel>Regular Price *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Regular price"
                                    min={0}
                                    step="0.01"
                                    {...form.register("price", {
                                      valueAsNumber: true,
                                    })}
                                  />
                                </FormControl>
                                {errors.price && (
                                  <FormMessage>
                                    {errors.price.message}
                                  </FormMessage>
                                )}
                              </FormItem>

                              <FormItem>
                                <FormLabel>Sale Price</FormLabel>
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Sale price"
                                      min={0}
                                      step="0.01"
                                      {...form.register("salePrice", {
                                        valueAsNumber: true,
                                      })}
                                    />
                                  </FormControl>
                                  {discountPercentage > 0 && (
                                    <Badge variant="secondary">
                                      {discountPercentage}% OFF
                                    </Badge>
                                  )}
                                </div>
                                <FormDescription>
                                  Leave same as regular price if not on sale
                                </FormDescription>
                                {errors.salePrice && (
                                  <FormMessage>
                                    {errors.salePrice.message}
                                  </FormMessage>
                                )}
                              </FormItem>
                            </div>

                            <div className="p-4 rounded-lg mt-6 border">
                              <h3 className="font-medium mb-2">
                                Price Summary
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div>Regular Price:</div>
                                <div className="font-medium">
                                  ₹{formValues.price?.toFixed(2)}
                                </div>
                                <div>Sale Price:</div>
                                <div className="font-medium">
                                  ₹{formValues.salePrice?.toFixed(2)}
                                </div>
                                {discountPercentage > 0 && (
                                  <>
                                    <div>Discount:</div>
                                    <div className="font-medium text-green-600">
                                      {discountPercentage}%
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="attributes"
                            className="space-y-4 mt-4"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">
                                Product Attributes
                              </h3>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAttribute}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Attribute
                              </Button>
                            </div>

                            {formValues.attributes?.map((attr, index) => (
                              <div
                                key={index}
                                className="p-4 rounded-lg mb-4 border"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="grid grid-cols-2 gap-4 flex-1">
                                    <FormItem>
                                      <FormLabel>Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g. Color, Size, Weight"
                                          value={attr?.name ?? ""}
                                          onChange={(e) =>
                                            updateAttributeName(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </FormControl>
                                      {errors.attributes?.[index]?.name && (
                                        <FormMessage>
                                          {
                                            errors.attributes[index]?.name
                                              ?.message
                                          }
                                        </FormMessage>
                                      )}
                                    </FormItem>

                                    <FormItem>
                                      <FormLabel>Value</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g. Red, XL, 250g"
                                          value={attr?.value ?? ""}
                                          onChange={(e) =>
                                            updateAttributeValue(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </FormControl>
                                      {errors.attributes?.[index]?.value && (
                                        <FormMessage>
                                          {
                                            errors.attributes[index]?.value
                                              ?.message
                                          }
                                        </FormMessage>
                                      )}
                                    </FormItem>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="flex-shrink-0 mt-6"
                                    onClick={() => removeAttribute(index)}
                                    disabled={formValues.attributes.length <= 1}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <CardFooter className="flex justify-between border-t pt-6">
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => form.reset()}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                type="submit"
                                disabled={isUploading}
                              >
                                Edit Product
                              </Button>
                            </CardFooter>
                          </TabsContent>
                        </CardContent>
                      </Tabs>
                    </Card>
                  </form>
                </FormProvider>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
