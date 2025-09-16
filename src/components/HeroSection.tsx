import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, MapPin, Leaf, Search } from "lucide-react";
import heroImage from "@/assets/hero-herbs.jpg";

interface HeroSectionProps {
  onTraceBatch: () => void;
  onBack?: () => void;
}

const HeroSection = ({ onTraceBatch, onBack }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Ayurvedic herbs in natural farm setting" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-primary/90 via-forest-primary/70 to-forest-secondary/80" />
      </div>
      
      {/* Content */}
          <div className="relative z-10 container mx-auto px-6 text-center">
            {onBack && (
              <button onClick={onBack} className="absolute left-6 top-6 text-forest-primary hover:text-forest-secondary">
                ← Back
              </button>
            )}
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Trace Your
            <span className="block bg-gradient-to-r from-saffron-primary to-saffron-light bg-clip-text text-transparent">
              Ayurvedic Journey
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
            From farm to pharmacy, discover the complete story behind every herb. 
            Blockchain-verified authenticity for Ayurvedic medicines you can trust.
          </p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <MapPin className="w-8 h-8 text-saffron-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Geo-Verified Origins</h3>
              <p className="text-primary-foreground/80 text-sm">GPS-tracked harvesting from authenticated regions</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Shield className="w-8 h-8 text-saffron-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Lab Certified</h3>
              <p className="text-primary-foreground/80 text-sm">Quality tested for purity and potency</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Leaf className="w-8 h-8 text-saffron-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Blockchain Secured</h3>
              <p className="text-primary-foreground/80 text-sm">Immutable record of every processing step</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onTraceBatch}
              size="lg" 
              className="bg-saffron-primary hover:bg-saffron-light text-accent-foreground font-semibold px-8 py-4 rounded-full text-lg shadow-warm transition-all duration-300 hover:scale-105"
            >
              <Search className="w-5 h-5 mr-2" />
              Trace Your Batch
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 text-primary-foreground hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full text-lg transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating Animation Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-saffron-primary rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-saffron-light rounded-full animate-pulse opacity-40 delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-primary-foreground rounded-full animate-pulse opacity-50 delay-500" />
      </div>
    </section>
  );
};

export default HeroSection;