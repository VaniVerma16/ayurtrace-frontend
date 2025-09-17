import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProvenance } from "@/lib/api";

interface BatchLookupProps {
  onBatchFound: (batchId: string) => void;
}

const BatchLookup = ({ onBatchFound }: BatchLookupProps) => {
  const [batchId, setBatchId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchId.trim()) {
      toast({
        title: "Batch ID Required",
        description: "Please enter a valid batch ID to trace",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use centralized API function
      try {
        await getProvenance(batchId.trim());
        onBatchFound(batchId.trim());
      } catch (error: any) {
        if (error?.error === "NOT_FOUND") {
          toast({
            title: "Batch Not Found",
            description: "The batch ID you entered could not be found in our system",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connection Error",
            description: error?.message || "Unable to connect to the traceability system. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
    } catch (error) {
      console.error('Batch lookup error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast({
            title: "Request Timeout",
            description: "The server is taking too long to respond. It may be starting up - please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the traceability system. Please check your internet connection and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the traceability system. The server may be starting up - please wait a moment and try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the traceability system. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-earth-light to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Verify Your Product
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter your batch ID to see the complete journey of your Ayurvedic herbs
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-border shadow-elegant">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="batchId" className="text-lg font-semibold text-foreground block">
                    Batch ID
                  </label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="batchId"
                      type="text"
                      placeholder="e.g., B-WITHA-20250916-farmer-123"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="pl-12 pr-4 py-4 text-lg rounded-full border-2 focus:border-accent focus:ring-accent/20"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="w-full bg-forest-primary hover:bg-forest-secondary text-primary-foreground font-semibold py-4 rounded-full text-lg shadow-elegant transition-all duration-300 hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Trace This Batch
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-earth-warm/50 rounded-2xl border border-accent/20">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Sample Batch IDs</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Try these sample batch IDs to explore the system:
                    </p>
                    <div className="space-y-1">
                      <code className="block text-sm bg-background/60 px-3 py-2 rounded border text-foreground">
                        B-WITHA-20250916-farmer-123
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BatchLookup;