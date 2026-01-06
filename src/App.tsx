import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AllTools from "./pages/AllTools";
import NotFound from "./pages/NotFound";
import MergePDF from "./pages/tools/MergePDF";
import SplitPDF from "./pages/tools/SplitPDF";
import DeletePages from "./pages/tools/DeletePages";
import ExtractPages from "./pages/tools/ExtractPages";
import OrganizePDF from "./pages/tools/OrganizePDF";
import ScanToPdf from "./pages/tools/ScanToPdf";
import CompressPDF from "./pages/tools/CompressPDF";
import RepairPDF from "./pages/tools/RepairPDF";
import OcrPDF from "./pages/tools/OcrPDF";
import JpgToPdf from "./pages/tools/JpgToPdf";
import WordToPdf from "./pages/tools/WordToPdf";
import PptToPdf from "./pages/tools/PptToPdf";
import ExcelToPdf from "./pages/tools/ExcelToPdf";
import HtmlToPdf from "./pages/tools/HtmlToPdf";
import PdfToJpg from "./pages/tools/PdfToJpg";
import PdfToWord from "./pages/tools/PdfToWord";
import PdfToPpt from "./pages/tools/PdfToPpt";
import PdfToExcel from "./pages/tools/PdfToExcel";
import PdfToPdfa from "./pages/tools/PdfToPdfa";
import RotatePDF from "./pages/tools/RotatePDF";
import PageNumbers from "./pages/tools/PageNumbers";
import Watermark from "./pages/tools/Watermark";
import CropPDF from "./pages/tools/CropPDF";
import EditPDF from "./pages/tools/EditPDF";
import UnlockPDF from "./pages/tools/UnlockPDF";
import ProtectPDF from "./pages/tools/ProtectPDF";
import SignPDF from "./pages/tools/SignPDF";
import RedactPDF from "./pages/tools/RedactPDF";
import ComparePDF from "./pages/tools/ComparePDF";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools" element={<AllTools />} />
          <Route path="/merge" element={<MergePDF />} />
          <Route path="/split" element={<SplitPDF />} />
          <Route path="/delete-pages" element={<DeletePages />} />
          <Route path="/extract-pages" element={<ExtractPages />} />
          <Route path="/organize" element={<OrganizePDF />} />
          <Route path="/scan-to-pdf" element={<ScanToPdf />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/repair" element={<RepairPDF />} />
          <Route path="/ocr" element={<OcrPDF />} />
          <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/ppt-to-pdf" element={<PptToPdf />} />
          <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
          <Route path="/html-to-pdf" element={<HtmlToPdf />} />
          <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/pdf-to-ppt" element={<PdfToPpt />} />
          <Route path="/pdf-to-excel" element={<PdfToExcel />} />
          <Route path="/pdf-to-pdfa" element={<PdfToPdfa />} />
          <Route path="/rotate" element={<RotatePDF />} />
          <Route path="/page-numbers" element={<PageNumbers />} />
          <Route path="/watermark" element={<Watermark />} />
          <Route path="/crop" element={<CropPDF />} />
          <Route path="/edit" element={<EditPDF />} />
          <Route path="/unlock" element={<UnlockPDF />} />
          <Route path="/protect" element={<ProtectPDF />} />
          <Route path="/sign" element={<SignPDF />} />
          <Route path="/redact" element={<RedactPDF />} />
          <Route path="/compare" element={<ComparePDF />} />
          <Route path="/convert" element={<AllTools />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
