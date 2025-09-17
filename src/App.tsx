import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProvenanceDisplay from "@/components/ProvenanceDisplay";
import { useParams } from "react-router-dom";

// Route wrapper to extract batchid param and render ProvenanceDisplay
function ProvenanceRoute() {
  const batchid = useParams().batchid;
  return batchid ? (
    <ProvenanceDisplay batchId={batchid} onBack={() => window.location.href = '/'} />
  ) : null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path=":batchid" element={<ProvenanceRoute />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
