import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Factory, ArrowLeft, Plus, CheckCircle, Clock, Package, Truck, Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listBatches, addProcessingStep } from "@/lib/api";

interface ProcessorPortalProps {
  onBack: () => void;
}

interface Batch {
  id: string;
  species: string;
  status_phase: string;
  date_utc: string;
}

interface ProcessingStep {
  batch_id: string;
  step_type: string;
  status: string;
}

const PROCESSING_STEPS = [
  { value: 'RECEIPT', label: 'Receipt & Inspection', icon: Package },
  { value: 'DRYING', label: 'Drying Process', icon: Settings },
  { value: 'GRINDING', label: 'Grinding & Powdering', icon: Settings },
  { value: 'SIEVING', label: 'Sieving & Sorting', icon: Settings },
  { value: 'PACKAGING', label: 'Final Packaging', icon: Package },
  { value: 'SHIPPING', label: 'Ready for Shipping', icon: Truck },
];

const ProcessorPortal = ({ onBack }: ProcessorPortalProps) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmitStep = async () => {
    if (!selectedBatch || !selectedStep) {
      toast({
        title: "Selection Required",
        description: "Please select both a batch and processing step",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addProcessingStep({
        batch_id: selectedBatch,
        step_type: selectedStep,
        status: 'COMPLETED'
      });
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: "Processing Step Recorded",
        description: `${selectedStep.replace(/_/g, ' ')} step has been added to the blockchain`,
      });
      // Reset selections
      setSelectedBatch('');
      setSelectedStep('');
      // Refresh batches to show updated status
      fetchBatches();
    } catch (error: any) {
      console.error('Error submitting processing step:', error);
      toast({
        title: "Submission Failed",
        description: error?.message || "Unable to record processing step",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created': return 'bg-blue-500 text-blue-50';
      case 'receipt_done': return 'bg-green-500 text-green-50';
      case 'drying_done': return 'bg-orange-500 text-orange-50';
      case 'grinding_done': return 'bg-purple-500 text-purple-50';
      case 'packaging_done': return 'bg-teal-500 text-teal-50';
      case 'ready_to_ship': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getNextSteps = (currentStatus: string) => {
    const statusStepMap: { [key: string]: string[] } = {
      'CREATED': ['RECEIPT'],
      'RECEIPT_DONE': ['DRYING'],
      'DRYING_DONE': ['GRINDING'],
      'GRINDING_DONE': ['SIEVING'],
      'SIEVING_DONE': ['PACKAGING'],
      'PACKAGING_DONE': ['SHIPPING'],
    };
    
    return statusStepMap[currentStatus] || [];
  };

  const selectedBatchData = batches.find(b => b.id === selectedBatch);
  const availableSteps = selectedBatchData ? getNextSteps(selectedBatchData.status_phase) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Selection
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
              <Factory className="w-8 h-8 text-orange-600" />
              Processor Portal
            </h1>
            <p className="text-muted-foreground">Track processing steps and manage batch workflows</p>
          </div>
          
          <Button onClick={fetchBatches} variant="outline" size="lg" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Batch Selection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-600" />
                <span>Select Batch</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading batches...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedBatch === batch.id
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-border hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                      onClick={() => setSelectedBatch(batch.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground text-sm">{batch.id}</h4>
                        <Badge className={`text-xs ${getStatusColor(batch.status_phase)}`}>
                          {batch.status_phase.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p><strong>Species:</strong> {batch.species}</p>
                        <p><strong>Date:</strong> {new Date(batch.date_utc).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Step Selection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-orange-600" />
                <span>Add Processing Step</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Selected Batch:</label>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {selectedBatch || 'No batch selected'}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Available Steps:</label>
                <Select value={selectedStep} onValueChange={setSelectedStep}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select processing step" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSteps.length > 0 ? (
                      availableSteps.map((stepType) => {
                        const step = PROCESSING_STEPS.find(s => s.value === stepType);
                        if (!step) return null;
                        const IconComponent = step.icon;
                        
                        return (
                          <SelectItem key={step.value} value={step.value}>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4" />
                              <span>{step.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="none" disabled>
                        {selectedBatch ? 'No steps available for current status' : 'Select a batch first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSubmitStep}
                disabled={isSubmitting || !selectedBatch || !selectedStep || availableSteps.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-full transition-all duration-300 hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Recording Step...
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Processing Step
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Processing Timeline */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>Processing Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PROCESSING_STEPS.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = selectedBatchData && selectedBatchData.status_phase.includes(step.value);
                  const isCurrent = availableSteps.includes(step.value);
                  
                  return (
                    <div key={step.value} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-success text-success-foreground' 
                          : isCurrent 
                            ? 'bg-orange-600 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          isCompleted ? 'text-success' : isCurrent ? 'text-orange-600' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isCompleted ? 'Completed' : isCurrent ? 'Available' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <Card className="mt-8 border-2 border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Factory className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Processing Guidelines</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Each processing step is recorded immutably on the blockchain</li>
                  <li>• Steps must be completed in the correct sequence</li>
                  <li>• Only batches that pass quality gates can proceed</li>
                  <li>• All processing data contributes to consumer traceability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessorPortal;