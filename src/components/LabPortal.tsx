import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Beaker, ArrowLeft, Upload, CheckCircle, AlertTriangle, Droplets, Bug, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listBatches, addLabTest } from "@/lib/api";

interface LabPortalProps {
  onBack: () => void;
}

interface Batch {
  id: string;
  species: string;
  status_phase: string;
  date_utc: string;
}

interface LabTest {
  batch_id: string;
  moisture_pct: number;
  pesticide_pass: boolean;
}

const LabPortal = ({ onBack }: LabPortalProps) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testData, setTestData] = useState<LabTest>({
    batch_id: '',
    moisture_pct: 0,
    pesticide_pass: true
  });
  const { toast } = useToast();

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const data = await listBatches();
      setBatches(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      toast({
        title: "Connection Error",
        description: error?.message || "Unable to connect to the system. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testData.batch_id) {
      toast({
        title: "Batch Required",
        description: "Please select a batch to test",
        variant: "destructive",
      });
      return;
    }
    if (testData.moisture_pct <= 0 || testData.moisture_pct > 100) {
      toast({
        title: "Invalid Moisture",
        description: "Moisture percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await addLabTest(testData);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: "Test Submitted Successfully",
        description: "Lab test results have been recorded in the blockchain",
      });
      // Reset form
      setTestData({
        batch_id: '',
        moisture_pct: 0,
        pesticide_pass: true
      });
      setSelectedBatch('');
      // Refresh batches
      fetchBatches();
    } catch (error: any) {
      console.error('Error submitting test:', error);
      toast({
        title: "Submission Failed",
        description: error?.message || "Unable to submit test results",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatch(batchId);
    setTestData(prev => ({ ...prev, batch_id: batchId }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready': return 'bg-success text-success-foreground';
      case 'testing': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Selection
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
              <Beaker className="w-8 h-8 text-blue-600" />
              Laboratory Portal
            </h1>
            <p className="text-muted-foreground">Upload test results and manage quality assessments</p>
          </div>
          
          <Button onClick={fetchBatches} variant="outline" size="lg" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Batches */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span>Batches Available for Testing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading batches...</p>
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
                  <p className="text-muted-foreground">No batches available for testing</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedBatch === batch.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-border hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                      onClick={() => handleBatchSelect(batch.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{batch.id}</h4>
                        <Badge className={`text-xs ${getStatusColor(batch.status_phase)}`}>
                          {batch.status_phase.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Species:</strong> {batch.species}</p>
                        <p><strong>Date:</strong> {new Date(batch.date_utc).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Results Form */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Submit Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTest} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="selectedBatch">Selected Batch</Label>
                  <Input
                    id="selectedBatch"
                    value={selectedBatch}
                    placeholder="Select a batch from the list"
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moisture" className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Moisture Content (%)</span>
                  </Label>
                  <Input
                    id="moisture"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={testData.moisture_pct || ''}
                    onChange={(e) => setTestData(prev => ({ 
                      ...prev, 
                      moisture_pct: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="e.g., 10.5"
                    className="text-lg"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Standard threshold: ≤12% for most herbs
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Bug className="w-4 h-4 text-green-500" />
                    <span>Pesticide Test Result</span>
                  </Label>
                  <div className="flex items-center space-x-4 p-4 bg-earth-warm/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pesticide"
                        checked={testData.pesticide_pass}
                        onCheckedChange={(checked) => setTestData(prev => ({ 
                          ...prev, 
                          pesticide_pass: checked 
                        }))}
                      />
                      <Label htmlFor="pesticide" className="cursor-pointer">
                        {testData.pesticide_pass ? (
                          <span className="flex items-center space-x-1 text-success">
                            <CheckCircle className="w-4 h-4" />
                            <span>PASS</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-destructive">
                            <AlertTriangle className="w-4 h-4" />
                            <span>FAIL</span>
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !selectedBatch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-full text-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting Results...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Submit Test Results
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <Card className="mt-8 border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Beaker className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Quality Testing Guidelines</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Moisture content should typically be ≤12% for proper preservation</li>
                  <li>• Pesticide tests must pass according to AYUSH Ministry standards</li>
                  <li>• All test results are recorded immutably on the blockchain</li>
                  <li>• Failed tests will trigger quality gate restrictions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabPortal;