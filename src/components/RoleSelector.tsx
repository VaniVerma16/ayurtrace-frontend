import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, Factory, Users, ArrowRight } from "lucide-react";

interface RoleSelectorProps {
  onRoleSelect: (role: 'lab' | 'processor' | 'consumer') => void;
}

const ROLES = [
  {
    id: 'consumer' as const,
    title: 'Consumer',
    description: 'Verify product authenticity and trace herb journey',
    icon: Users,
    color: 'bg-forest-primary hover:bg-forest-secondary',
    features: ['Batch traceability', 'Quality verification', 'Origin mapping']
  },
  {
    id: 'lab' as const,
    title: 'Laboratory',
    description: 'Upload test results and quality assessments',
    icon: Beaker,
    color: 'bg-blue-600 hover:bg-blue-700',
    features: ['Test result upload', 'Quality gate management', 'Batch certification']
  },
  {
    id: 'processor' as const,
    title: 'Processor',
    description: 'Track processing steps and batch management',
    icon: Factory,
    color: 'bg-orange-600 hover:bg-orange-700',
    features: ['Processing steps', 'Batch tracking', 'Status updates']
  }
];

const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-earth-light to-background flex items-center justify-center py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Welcome to
            <span className="block bg-gradient-to-r from-forest-primary to-saffron-primary bg-clip-text text-transparent">
              AyurTrace
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role to access the appropriate portal for Ayurvedic herb traceability
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {ROLES.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card key={role.id} className="border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-elegant">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${role.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">{role.title}</CardTitle>
                  <p className="text-muted-foreground">{role.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => onRoleSelect(role.id)}
                    className={`w-full ${role.color} text-white font-semibold py-3 rounded-full transition-all duration-300 hover:scale-[1.02]`}
                  >
                    Enter {role.title} Portal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Powered by blockchain technology for complete transparency and trust
          </p>
        </div>
      </div>
    </section>
  );
};

export default RoleSelector;