import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Table as TableIcon, Users, Package } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";

const ExportReports = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [exporting, setExporting] = useState<string | null>(null);

  // Fetch data for reports
  const { data: vendorData } = useQuery({
    queryKey: ["vendor-report-data"],
    queryFn: async () => {
      const { data: vendors, error } = await supabase
        .from("user_approval_status")
        .select("user_id, business_name, email, status, requested_at");

      if (error) throw error;

      const { data: profiles } = await supabase
        .from("vendor_profiles")
        .select("user_id, business_name, email, phone");

      const { data: products } = await supabase
        .from("products")
        .select("user_id")
        .is("deleted_at", null);

      const productCounts = products?.reduce((acc: any, p: any) => {
        acc[p.user_id] = (acc[p.user_id] || 0) + 1;
        return acc;
      }, {});

      return vendors?.map((vendor: any) => ({
        ...vendor,
        profile: profiles?.find((p: any) => p.user_id === vendor.user_id),
        productCount: productCounts?.[vendor.user_id] || 0,
      }));
    },
    enabled: isAdmin,
  });

  const { data: inquiryData } = useQuery({
    queryKey: ["inquiry-report-data"],
    queryFn: async () => {
      const { data: inquiries, error } = await supabase
        .from("catalog_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return inquiries;
    },
    enabled: isAdmin,
  });

  const { data: productData } = useQuery({
    queryKey: ["product-report-data"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: interests } = await supabase
        .from("product_interests")
        .select("product_id");

      const interestCounts = interests?.reduce((acc: any, i: any) => {
        acc[i.product_id] = (acc[i.product_id] || 0) + 1;
        return acc;
      }, {});

      return products?.map((product: any) => ({
        ...product,
        interestCount: interestCounts?.[product.id] || 0,
      }));
    },
    enabled: isAdmin,
  });

  // Export Vendor Performance PDF
  const exportVendorPDF = () => {
    setExporting("vendor-pdf");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Vendor Performance Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 28);

    const tableData = vendorData?.map((vendor: any) => [
      vendor.profile?.business_name || vendor.business_name || "N/A",
      vendor.profile?.email || vendor.email || "N/A",
      vendor.status,
      vendor.productCount.toString(),
      format(new Date(vendor.requested_at), "MMM dd, yyyy"),
    ]);

    autoTable(doc, {
      head: [["Business Name", "Email", "Status", "Products", "Joined"]],
      body: tableData || [],
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`vendor-performance-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Vendor report exported successfully");
    setExporting(null);
  };

  // Export Customer Inquiries Excel
  const exportInquiriesExcel = () => {
    setExporting("inquiry-excel");

    const worksheetData = inquiryData?.map((inquiry: any) => ({
      "Customer Name": inquiry.customer_name,
      "Email": inquiry.customer_email,
      "Phone": inquiry.customer_phone || "N/A",
      "Message": inquiry.message,
      "Date": format(new Date(inquiry.created_at), "MMM dd, yyyy HH:mm"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");

    XLSX.writeFile(workbook, `customer-inquiries-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Inquiry report exported successfully");
    setExporting(null);
  };

  // Export Product Trends PDF
  const exportProductsPDF = () => {
    setExporting("product-pdf");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Product Trends Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 28);

    const topProducts = productData
      ?.sort((a: any, b: any) => b.interestCount - a.interestCount)
      .slice(0, 50);

    const tableData = topProducts?.map((product: any) => [
      product.name,
      product.sku || "N/A",
      product.category || "N/A",
      `₹${product.retail_price?.toLocaleString() || 0}`,
      product.interestCount.toString(),
    ]);

    autoTable(doc, {
      head: [["Product Name", "SKU", "Category", "Price", "Interests"]],
      body: tableData || [],
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`product-trends-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Product trends report exported successfully");
    setExporting(null);
  };

  // Export All Data Excel
  const exportAllDataExcel = () => {
    setExporting("all-excel");

    const workbook = XLSX.utils.book_new();

    // Vendors sheet
    const vendorsData = vendorData?.map((vendor: any) => ({
      "Business Name": vendor.profile?.business_name || vendor.business_name || "N/A",
      "Email": vendor.profile?.email || vendor.email || "N/A",
      "Phone": vendor.profile?.phone || "N/A",
      "Status": vendor.status,
      "Products": vendor.productCount,
      "Joined": format(new Date(vendor.requested_at), "MMM dd, yyyy"),
    }));
    const vendorsSheet = XLSX.utils.json_to_sheet(vendorsData || []);
    XLSX.utils.book_append_sheet(workbook, vendorsSheet, "Vendors");

    // Inquiries sheet
    const inquiriesData = inquiryData?.map((inquiry: any) => ({
      "Customer Name": inquiry.customer_name,
      "Email": inquiry.customer_email,
      "Phone": inquiry.customer_phone || "N/A",
      "Message": inquiry.message,
      "Date": format(new Date(inquiry.created_at), "MMM dd, yyyy"),
    }));
    const inquiriesSheet = XLSX.utils.json_to_sheet(inquiriesData || []);
    XLSX.utils.book_append_sheet(workbook, inquiriesSheet, "Inquiries");

    // Products sheet
    const productsData = productData?.slice(0, 1000).map((product: any) => ({
      "Name": product.name,
      "SKU": product.sku || "N/A",
      "Category": product.category || "N/A",
      "Price": product.retail_price || 0,
      "Stock": product.stock_quantity || 0,
      "Interests": product.interestCount,
    }));
    const productsSheet = XLSX.utils.json_to_sheet(productsData || []);
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");

    XLSX.writeFile(workbook, `complete-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Complete report exported successfully");
    setExporting(null);
  };

  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/super-admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Download className="h-8 w-8" />
            Export Reports
          </h1>
          <p className="text-muted-foreground mt-1">Generate and download various reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vendor Performance
            </CardTitle>
            <CardDescription>
              Export vendor statistics including products, status, and join dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={exportVendorPDF}
              disabled={exporting === "vendor-pdf"}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === "vendor-pdf" ? "Exporting..." : "Export as PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Customer Inquiries
            </CardTitle>
            <CardDescription>
              Export all customer inquiries with contact details and messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={exportInquiriesExcel}
              disabled={exporting === "inquiry-excel"}
              className="w-full"
              variant="secondary"
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === "inquiry-excel" ? "Exporting..." : "Export as Excel"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Trends
            </CardTitle>
            <CardDescription>
              Export top products with interest counts and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={exportProductsPDF}
              disabled={exporting === "product-pdf"}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === "product-pdf" ? "Exporting..." : "Export as PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Complete Report
            </CardTitle>
            <CardDescription>
              Export all data (vendors, inquiries, products) in one Excel file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={exportAllDataExcel}
              disabled={exporting === "all-excel"}
              className="w-full"
              variant="secondary"
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === "all-excel" ? "Exporting..." : "Export as Excel"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportReports;
