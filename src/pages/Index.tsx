import { useState } from "react";
import RoleSelector from "@/components/RoleSelector";
import HeroSection from "@/components/HeroSection";
import BatchLookup from "@/components/BatchLookup";
import ProvenanceDisplay from "@/components/ProvenanceDisplay";
import LabPortal from "@/components/LabPortal";
import ProcessorPortal from "@/components/ProcessorPortal";

type ViewState = 'roleSelect' | 'hero' | 'lookup' | 'provenance' | 'lab' | 'processor';
type UserRole = 'lab' | 'processor' | 'consumer';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('roleSelect');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  console.log('Index mounted. currentView:', currentView, 'selectedBatchId:', selectedBatchId);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'consumer') {
      setCurrentView('hero');
    } else if (role === 'lab') {
      setCurrentView('lab');
    } else if (role === 'processor') {
      setCurrentView('processor');
    }
  };

  const handleTraceBatch = () => {
    setCurrentView('lookup');
  };

  const handleBatchFound = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCurrentView('provenance');
  };

  const handleBackToLookup = () => {
    setCurrentView('lookup');
    setSelectedBatchId('');
  };

  const handleBackToHero = () => {
    setCurrentView('hero');
    setSelectedBatchId('');
  };

  const handleBackToRoleSelect = () => {
    setCurrentView('roleSelect');
    setUserRole(null);
    setSelectedBatchId('');
  };

  return (
    <div className="min-h-screen">
      {currentView === 'roleSelect' && (
        <RoleSelector onRoleSelect={handleRoleSelect} />
      )}
      
      {currentView === 'hero' && (
        <>
          <HeroSection onTraceBatch={handleTraceBatch} onBack={handleBackToRoleSelect} />
          <BatchLookup onBatchFound={handleBatchFound} />
        </>
      )}
      
      {currentView === 'lookup' && (
        <div className="min-h-screen">
          <div className="container mx-auto px-6 py-8">
            <button 
              onClick={handleBackToHero}
              className="text-forest-primary hover:text-forest-secondary transition-colors mb-6"
            >
              ← Back to Home
            </button>
          </div>
          <BatchLookup onBatchFound={handleBatchFound} />
        </div>
      )}
      
      {currentView === 'provenance' && selectedBatchId && (
        <ProvenanceDisplay 
          batchId={selectedBatchId} 
          onBack={handleBackToLookup} 
        />
      )}

      {currentView === 'lab' && (
        <LabPortal onBack={handleBackToRoleSelect} />
      )}

      {currentView === 'processor' && (
        <ProcessorPortal onBack={handleBackToRoleSelect} />
      )}
    </div>
  );
};

export default Index;
