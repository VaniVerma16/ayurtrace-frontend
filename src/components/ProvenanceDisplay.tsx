import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, CheckCircle, AlertTriangle, Leaf, Beaker, Factory, ArrowLeft, Eye, Shield, Droplets, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProvenance, healthCheck } from "@/lib/api";

interface ProvenanceData {
  batch: {
    species_scientific: string;
    collector_id_masked: string;
    date_utc: string;
    status_phase: string;
    quality_gate: string;
    hash?: string;
  };
  collection: Array<{
    scientific_name: string;
    collector_id_masked: string;
    geo: { lat: number; lng: number };
    timestamp: string;
    ai?: { confidence: number };
    status: string;
    violations?: any[];
    hash?: string;
  }>;
  processing_steps: Array<{
    step_type: string;
    status: string;
    started_at?: string | null;
    ended_at?: string | null;
    params?: Record<string, any>;
    post_step_metrics?: Record<string, any>;
    notes?: string;
    hash?: string;
  }>;
  lab_results: Array<{
    moisture_pct: number;
    pesticide_pass: boolean;
    gate: string;
    pdf_url?: string | null;
    evaluated_at?: string;
    hash?: string;
  }>;
  ui: {
    map: { lat: number; lng: number };
    herb_names: {
      scientific: string;
      ai_verified_confidence?: number;
    };
    processing_summary: string[];
    recall_banner: boolean;
  };
}

interface ProvenanceDisplayProps {
  batchId: string;
  onBack: () => void;
}

const ProvenanceDisplay = ({ batchId, onBack }: ProvenanceDisplayProps) => {
  console.log("ProvenanceDisplay mounted");
  const [data, setData] = useState<ProvenanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const result = await healthCheck();
      if (result && (result.status === "ok" || result.ok)) {
        setTestStatus("✅ API is reachable and healthy.");
      } else {
        setTestStatus("⚠️ API responded but not healthy.");
      }
    } catch (err: any) {
      setTestStatus("❌ API is not reachable: " + (err?.message || "Unknown error"));
    } finally {
      setTesting(false);
    }
  };

  const fetchProvenance = async () => {
    console.log("fetchProvenance called", batchId);
    setIsLoading(true);
    setError(null);
    try {
      const provenanceData = await getProvenance(batchId);
      console.log('Provenance API response:', provenanceData);
      if (provenanceData.error === "NOT_FOUND") {
        setError("Batch not found in the system");
        toast({
          title: "Batch Not Found",
          description: "The batch ID you entered could not be found in our system",
          variant: "destructive",
        });
      } else {
        setData(provenanceData);
      }
    } catch (error: any) {
      setError(error?.message || "Failed to load batch information");
      toast({
        title: "Connection Error",
        description: error?.message || "Unable to connect to the traceability system. The server may be starting up - please wait a moment and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Trigger fetch when component mounts or when batchId changes
    if (batchId) {
      fetchProvenance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-light to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-forest-primary/30 border-t-forest-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading batch information...</p>
          <button
            className="mt-6 px-4 py-2 bg-forest-primary text-white rounded shadow hover:bg-forest-secondary disabled:opacity-50"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          {testStatus && (
            <div className="mt-4 text-lg">{testStatus}</div>
          )}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-light to-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Load Batch</h2>
          <p className="text-muted-foreground mb-6">{error || "Batch information could not be retrieved"}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Another Batch
          </Button>
          <button
            className="mt-6 px-4 py-2 bg-forest-primary text-white rounded shadow hover:bg-forest-secondary disabled:opacity-50"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          {testStatus && (
            <div className="mt-4 text-lg">{testStatus}</div>
          )}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass': return 'bg-success text-success-foreground';
      case 'fail': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'accepted': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-light to-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Batch Provenance</h1>
            <p className="text-muted-foreground font-mono">{batchId}</p>
          </div>
          
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        {data.ui.recall_banner && (
          <div className="mb-8 p-4 bg-warning/10 border border-warning rounded-2xl">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <div>
                <h3 className="font-semibold text-foreground">Recall Notice</h3>
                <p className="text-sm text-muted-foreground">This batch has been recalled. Please contact your supplier.</p>
              </div>
            </div>
          </div>
        )}

        {/* Batch Overview */}
        <Card className="mb-8 border-2 shadow-elegant">
          <CardHeader className="bg-gradient-to-r from-forest-primary to-forest-secondary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <Leaf className="w-6 h-6" />
              <span>{data.ui.herb_names.scientific}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {new Date(data.batch.date_utc).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Harvest Date</div>
              </div>
              <div className="text-center">
                <Badge className={`text-sm ${getStatusColor(data.batch.quality_gate)}`}>{data.batch.quality_gate}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Quality Gate</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-sm">{data.batch.status_phase.replace(/_/g, ' ')}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Status</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground mb-1">Collector: {data.batch.collector_id_masked}</div>
                <div className="text-sm text-muted-foreground">Anonymized ID</div>
              </div>
              <div className="text-center">
                {typeof data.ui.herb_names.ai_verified_confidence === 'number' && (
                  <div className="text-sm text-success font-semibold mb-1">
                    AI Verified: {(data.ui.herb_names.ai_verified_confidence * 100).toFixed(1)}%
                  </div>
                )}
                {data.batch.hash && (
                  <div className="text-xs text-muted-foreground break-all">
                    <span className="font-mono">Hash:</span> {data.batch.hash}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Collection Information */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-forest-primary" />
                <span>Collection Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.collection.map((event, index) => (
                <div key={index} className="border rounded-lg p-4 bg-earth-warm/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-forest-primary" />
                      <span className="font-medium">Collection Event {index + 1}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{new Date(event.timestamp).toLocaleString()}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>Location: {event.geo.lat.toFixed(4)}, {event.geo.lng.toFixed(4)}</span>
                    </div>
                    {event.ai && (
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-success" />
                        <span>AI Verified: {(event.ai.confidence * 100).toFixed(1)}% confidence</span>
                      </div>
                    )}
                    {event.hash && (
                      <div className="text-xs text-muted-foreground break-all">
                        <span className="font-mono">Hash:</span> {event.hash}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Processing Steps */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Factory className="w-5 h-5 text-forest-primary" />
                <span>Processing Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.processing_steps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 bg-earth-warm/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-forest-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{index + 1}</div>
                      <span className="font-medium">{step.step_type.replace(/_/g, ' ')}</span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(step.status)}`}>{step.status}</Badge>
                  </div>
                  {(step.started_at || step.ended_at) && (
                    <div className="text-sm text-muted-foreground ml-10">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Started: {step.started_at ? new Date(step.started_at).toLocaleString() : "-"} | Ended: {step.ended_at ? new Date(step.ended_at).toLocaleString() : "-"}
                    </div>
                  )}
                  {step.hash && (
                    <div className="text-xs text-muted-foreground break-all ml-10">
                      <span className="font-mono">Hash:</span> {step.hash}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Lab Results */}
        {data.lab_results.length > 0 && (
          <Card className="mt-8 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="w-5 h-5 text-forest-primary" />
                <span>Laboratory Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {data.lab_results.map((test, index) => (
                  <div key={index} className="border rounded-lg p-6 bg-gradient-to-br from-background to-earth-warm/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">Test #{index + 1}</h4>
                      <Badge className={`${getStatusColor(test.gate)}`}>{test.gate}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Moisture Content</span>
                        </div>
                        <span className="font-medium">{test.moisture_pct}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bug className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Pesticide Test</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {test.pesticide_pass ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="font-medium text-sm">{test.pesticide_pass ? 'PASS' : 'FAIL'}</span>
                        </div>
                      </div>
                      {test.hash && (
                        <div className="text-xs text-muted-foreground break-all">
                          <span className="font-mono">Hash:</span> {test.hash}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProvenanceDisplay;