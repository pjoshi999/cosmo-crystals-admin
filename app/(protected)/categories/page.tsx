"use client";
import { useState } from "react";
import { apiClient } from "@/api/apiClient";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { queryClient } from "../../QueryProvider";
import { categoryKeys } from "@/api/endpoints/category";
import {
  Loader2,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import { useCategory } from "@/hooks/queries/useCategories";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Category, SubCategory } from "@/types";
import Image from "next/image";
import { handleApiError } from "@/utils/apiHelpers";
import { ApiError } from "@/types/error";

export default function CategoriesPage() {
  const { data, isLoading } = useCategory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory>();

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    // slug: "",
    description: "",
    // image: "",
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    // slug: "",
    categoryId: "",
  });

  const filteredCategories = data?.categories?.filter(
    (category: Category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subCategory.some((sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await apiClient.delete(`/category/${id}`);

      if (response && response.data) {
        toast.success(
          response?.data?.message || "Category deleted successfully"
        );
        await queryClient.invalidateQueries({
          queryKey: categoryKeys.list({}),
        });
      }
    } catch (error) {
      //   toast.error("Failed to delete category");
      handleApiError(error as ApiError);
      console.error(error);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      const response = await apiClient.delete(`/subcategory/${id}`);

      if (response && response.data) {
        toast.success(
          response?.data?.message || "Subcategory deleted successfully"
        );
        await queryClient.invalidateQueries({
          queryKey: categoryKeys.list({}),
        });
      }
    } catch (error) {
      //   toast.error("Failed to delete subcategory");
      handleApiError(error as ApiError);
      console.error(error);
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await apiClient.post(
        "/category/create-category/",
        categoryForm
      );

      if (response && response.data) {
        toast.success("Category added successfully");
        await queryClient.invalidateQueries({
          queryKey: categoryKeys.list({}),
        });
        setIsAddCategoryOpen(false);
        setCategoryForm({ name: "", description: "" });
      }
    } catch (error) {
      handleApiError(error as ApiError);
      //   toast.error(error?.response?.data?.error);
      console.error(error);
    }
  };

  const handleEditCategory = async () => {
    try {
      const response = await apiClient.patch(
        `/category/${selectedCategory?.id}`,
        categoryForm
      );

      if (response && response.data) {
        toast.success("Category updated successfully");
        await queryClient.invalidateQueries({
          queryKey: categoryKeys.list({}),
        });
        setIsEditCategoryOpen(false);
      }
    } catch (error) {
      //   toast.error("Failed to update category");
      handleApiError(error as ApiError);
      console.error(error);
    }
  };

  const handleAddSubcategory = async () => {
    try {
      const response = await apiClient.post(
        "/subcategory/create-subcategory",
        subcategoryForm
      );

      if (response && response.data) {
        toast.success("Subcategory added successfully");
        await queryClient.invalidateQueries({
          queryKey: categoryKeys.list({}),
        });
        setIsAddSubcategoryOpen(false);
        setSubcategoryForm({ name: "", categoryId: "" });
      }
    } catch (error) {
      //   toast.error("Failed to add subcategory");
      handleApiError(error as ApiError);
      console.error(error);
    }
  };

  const handleEditSubcategory = async () => {
    try {
      const response = await apiClient.patch(
        `/subcategory/${selectedSubcategory?.id}`,
        subcategoryForm
      );

      if (response && response.data) {
        toast.success("Subcategory updated successfully");
        await queryClient.invalidateQueries({
          queryKey: categoryKeys.list({}),
        });
        setIsEditSubcategoryOpen(false);
      }
    } catch (error) {
      //   toast.error("Failed to update subcategory");
      handleApiError(error as ApiError);
      console.error(error);
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      //   image: category.image || "",
    });
    setIsEditCategoryOpen(true);
  };

  const openEditSubcategoryDialog = (subcategory: SubCategory) => {
    setSelectedSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      categoryId: subcategory.categoryId,
    });
    setIsEditSubcategoryOpen(true);
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
            <span className="ml-2">Loading categories...</span>
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
        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-2xl font-bold tracking-tight">
                Categories
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage your product categories and subcategories
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto mt-2 lg:mt-0">
              <Dialog
                open={isAddSubcategoryOpen}
                onOpenChange={setIsAddSubcategoryOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Subcategory</span>
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subcategory</DialogTitle>
                    <DialogDescription>
                      Create a new subcategory for your products
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="sub-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="sub-name"
                        value={subcategoryForm.name}
                        onChange={(e) =>
                          setSubcategoryForm({
                            ...subcategoryForm,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    {/* <div className="flex flex-col gap-2">
                      <Label htmlFor="sub-slug" className="text-right">
                        Slug
                      </Label>
                      <Input
                        id="sub-slug"
                        value={subcategoryForm.slug}
                        onChange={(e) =>
                          setSubcategoryForm({
                            ...subcategoryForm,
                            slug: e.target.value,
                          })
                        }
                        placeholder="auto-generated-if-empty"
                        className="col-span-3"
                      />
                    </div> */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="sub-category" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={subcategoryForm.categoryId}
                        onValueChange={(value) =>
                          setSubcategoryForm({
                            ...subcategoryForm,
                            categoryId: value,
                          })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {data?.categories?.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSubcategoryOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubcategory}>
                      Save Subcategory
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isAddCategoryOpen}
                onOpenChange={setIsAddCategoryOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Category</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a new category for your products
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name" className="text-right">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    {/* <div className="flex flex-col gap-2">
                      <Label htmlFor="slug" className="text-right">
                        Slug
                      </Label>
                      <Input
                        id="slug"
                        value={categoryForm.slug}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            slug: e.target.value,
                          })
                        }
                        placeholder="auto-generated-if-empty"
                        className="col-span-3"
                      />
                    </div> */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description" className="text-right">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    {/* <div className="flex flex-col gap-2">
                      <Label htmlFor="image" className="text-right">
                        Image URL *
                      </Label>
                      <Input
                        id="image"
                        value={categoryForm.image}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            image: e.target.value,
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="col-span-3"
                      />
                    </div> */}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddCategoryOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory}>Save Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories and subcategories..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="tree">Tree View</TabsTrigger>
              </TabsList>
              <div className="text-sm text-muted-foreground sm:block hidden">
                {filteredCategories?.length || 0} categories found
              </div>
            </div>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories?.map((category: Category) => (
                  <Card
                    key={category.id}
                    className="overflow-hidden h-full flex flex-col"
                  >
                    {category.image ? (
                      <div className="aspect-[4/3] relative bg-muted">
                        <Image
                          src={category.image || "/placeholder-image.jpg"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {category.name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSubcategoryForm({
                                  ...subcategoryForm,
                                  categoryId: category.id,
                                });
                                setIsAddSubcategoryOpen(true);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              <span>Add Subcategory</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditCategoryDialog(category)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Category</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Category</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {category.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Subcategories:</h4>
                        <Badge variant="outline">
                          {category.subCategory?.length || 0}
                        </Badge>
                      </div>
                      <ScrollArea className="max-h-24">
                        <div className="flex flex-wrap gap-2">
                          {category.subCategory &&
                          category.subCategory.length > 0 ? (
                            category.subCategory.map((sub) => (
                              <Badge
                                key={sub.id}
                                variant="outline"
                                className="flex items-center gap-1 pl-2 pr-1 py-0.5"
                              >
                                <span className="truncate max-w-32">
                                  {sub.name}
                                </span>
                                <div className="flex">
                                  <button
                                    className="text-muted-foreground hover:text-primary focus:outline-none p-0.5"
                                    onClick={() =>
                                      openEditSubcategoryDialog(sub)
                                    }
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    className="text-muted-foreground hover:text-destructive focus:outline-none p-0.5"
                                    onClick={() =>
                                      handleDeleteSubcategory(sub.id)
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No subcategories
                            </span>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="pt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditCategoryDialog(category)}
                      >
                        <Edit className="h-4 w-4 mr-1 md:mr-2" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1 md:mr-2" />
                        <span>Delete</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <Card>
                <ScrollArea className="h-[60vh]">
                  <div className="p-1">
                    {filteredCategories?.map(
                      (category: Category, index: number) => (
                        <div key={category.id}>
                          <div className="flex sm:flex-row flex-col items-start justify-between p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{category.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {category.subCategory?.length || 0}{" "}
                                  subcategories
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {category.description || "No description"}
                              </p>
                              {category.subCategory &&
                                category.subCategory.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {category.subCategory.map((sub) => (
                                      <Badge
                                        key={sub.id}
                                        variant="secondary"
                                        className="text-xs flex items-center gap-1 py-0"
                                      >
                                        {sub.name}
                                        <button
                                          className="focus:outline-none hover:text-primary"
                                          onClick={() =>
                                            openEditSubcategoryDialog(sub)
                                          }
                                        >
                                          <Edit className="h-2.5 w-2.5" />
                                        </button>
                                        <button
                                          className="focus:outline-none hover:text-destructive"
                                          onClick={() =>
                                            handleDeleteSubcategory(sub.id)
                                          }
                                        >
                                          <X className="h-2.5 w-2.5" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSubcategoryForm({
                                    ...subcategoryForm,
                                    categoryId: category.id,
                                  });
                                  setIsAddSubcategoryOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditCategoryDialog(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {index < filteredCategories.length - 1 && (
                            <Separator />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="tree">
              <Card>
                <CardHeader>
                  <CardTitle>Category Hierarchy</CardTitle>
                  <CardDescription>
                    View and manage your category structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {filteredCategories?.map((category: Category) => (
                      <AccordionItem value={category.id} key={category.id}>
                        <AccordionTrigger className="hover:bg-secondary/20 px-2 rounded-sm">
                          <div className="flex items-center gap-2">
                            <span>{category.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {category.subCategory?.length || 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 border-l-2 border-muted-foreground/20 ml-2 space-y-2">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm text-muted-foreground">
                                Subcategories
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSubcategoryForm({
                                    ...subcategoryForm,
                                    categoryId: category.id,
                                  });
                                  setIsAddSubcategoryOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                <span className="text-xs">Add</span>
                              </Button>
                            </div>

                            {category.subCategory &&
                            category.subCategory.length > 0 ? (
                              <div className="space-y-2">
                                {category.subCategory.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="flex items-center justify-between p-2 bg-secondary/10 rounded-md"
                                  >
                                    <span>{sub.name}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          openEditSubcategoryDialog(sub)
                                        }
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:text-destructive"
                                        onClick={() =>
                                          handleDeleteSubcategory(sub.id)
                                        }
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-2 text-sm text-muted-foreground">
                                No subcategories found
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditCategoryDialog(category)}
                              >
                                Edit Category
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            {/* <div className="flex flex-col gap-2">
              <Label htmlFor="edit-slug" className="text-right">
                Slug
              </Label>
              <Input
                id="edit-slug"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, slug: e.target.value })
                }
                className="col-span-3"
              />
            </div> */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            {/* <div className="flex flex-col gap-2">
              <Label htmlFor="edit-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="edit-image"
                value={categoryForm.image}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, image: e.target.value })
                }
                className="col-span-3"
              />
            </div> */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog
        open={isEditSubcategoryOpen}
        onOpenChange={setIsEditSubcategoryOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update subcategory information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-sub-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-sub-name"
                value={subcategoryForm.name}
                onChange={(e) =>
                  setSubcategoryForm({
                    ...subcategoryForm,
                    name: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            {/* <div className="flex flex-col gap-2">
              <Label htmlFor="edit-sub-slug" className="text-right">
                Slug
              </Label>
              <Input
                id="edit-sub-slug"
                value={subcategoryForm.slug}
                onChange={(e) =>
                  setSubcategoryForm({
                    ...subcategoryForm,
                    slug: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div> */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-sub-category" className="text-right">
                Category
              </Label>
              <Select
                value={subcategoryForm.categoryId}
                onValueChange={(value) =>
                  setSubcategoryForm({ ...subcategoryForm, categoryId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {data?.categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditSubcategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubcategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
