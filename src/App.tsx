import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CookieConsent from "@/components/CookieConsent";
import ScrollToTop from "./components/ScrollToTop";
import PageLoader from "./components/PageLoader";

// Core pages - loaded immediately
import Index from "./pages/Index";
import AllTools from "./pages/AllTools";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts"));
const AdminPostEditor = lazy(() => import("./pages/admin/AdminPostEditor"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminGuard = lazy(() => import("./components/admin/AdminGuard"));

// Tool pages - lazy loaded for optimal bundle splitting
const MergePDF = lazy(() => import("./pages/tools/MergePDF"));
const SplitPDF = lazy(() => import("./pages/tools/SplitPDF"));
const DeletePages = lazy(() => import("./pages/tools/DeletePages"));
const ExtractPages = lazy(() => import("./pages/tools/ExtractPages"));
const OrganizePDF = lazy(() => import("./pages/tools/OrganizePDF"));
const ScanToPdf = lazy(() => import("./pages/tools/ScanToPdf"));
const CompressPDF = lazy(() => import("./pages/tools/CompressPDF"));
const RepairPDF = lazy(() => import("./pages/tools/RepairPDF"));
const JpgToPdf = lazy(() => import("./pages/tools/JpgToPdf"));
const WordToPdf = lazy(() => import("./pages/tools/WordToPdf"));
const PptToPdf = lazy(() => import("./pages/tools/PptToPdf"));
const ExcelToPdf = lazy(() => import("./pages/tools/ExcelToPdf"));
const PdfToJpg = lazy(() => import("./pages/tools/PdfToJpg"));
const PdfToWord = lazy(() => import("./pages/tools/PdfToWord"));
const PdfToPpt = lazy(() => import("./pages/tools/PdfToPpt"));
const PdfToExcel = lazy(() => import("./pages/tools/PdfToExcel"));
const RotatePDF = lazy(() => import("./pages/tools/RotatePDF"));
const PageNumbers = lazy(() => import("./pages/tools/PageNumbers"));
const Watermark = lazy(() => import("./pages/tools/Watermark"));
const CropPDF = lazy(() => import("./pages/tools/CropPDF"));
const EditPDF = lazy(() => import("./pages/tools/EditPDF"));
const ComparePDF = lazy(() => import("./pages/tools/ComparePDF"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CookieConsent />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tools" element={<AllTools />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <AdminGuard><AdminDashboard /></AdminGuard>
              </Suspense>
            } />
            <Route path="/admin/posts" element={
              <Suspense fallback={<PageLoader />}>
                <AdminGuard><AdminPosts /></AdminGuard>
              </Suspense>
            } />
            <Route path="/admin/posts/new" element={
              <Suspense fallback={<PageLoader />}>
                <AdminGuard><AdminPostEditor /></AdminGuard>
              </Suspense>
            } />
            <Route path="/admin/posts/:id/edit" element={
              <Suspense fallback={<PageLoader />}>
                <AdminGuard><AdminPostEditor /></AdminGuard>
              </Suspense>
            } />
            <Route path="/admin/categories" element={
              <Suspense fallback={<PageLoader />}>
                <AdminGuard><AdminCategories /></AdminGuard>
              </Suspense>
            } />
            <Route path="/merge" element={<MergePDF />} />
            <Route path="/split" element={<SplitPDF />} />
            <Route path="/delete-pages" element={<DeletePages />} />
            <Route path="/extract-pages" element={<ExtractPages />} />
            <Route path="/organize" element={<OrganizePDF />} />
            <Route path="/scan-to-pdf" element={<ScanToPdf />} />
            <Route path="/compress" element={<CompressPDF />} />
            <Route path="/repair" element={<RepairPDF />} />
            <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/word-to-pdf" element={<WordToPdf />} />
            <Route path="/ppt-to-pdf" element={<PptToPdf />} />
            <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
            <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
            <Route path="/pdf-to-word" element={<PdfToWord />} />
            <Route path="/pdf-to-ppt" element={<PdfToPpt />} />
            <Route path="/pdf-to-excel" element={<PdfToExcel />} />
            <Route path="/rotate" element={<RotatePDF />} />
            <Route path="/page-numbers" element={<PageNumbers />} />
            <Route path="/watermark" element={<Watermark />} />
            <Route path="/crop" element={<CropPDF />} />
            <Route path="/edit" element={<EditPDF />} />
            <Route path="/compare" element={<ComparePDF />} />
            <Route path="/convert" element={<AllTools />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
