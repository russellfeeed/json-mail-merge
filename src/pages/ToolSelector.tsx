import { Link } from 'react-router-dom';
import { Wand2, Wrench, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import synertecLogo from '@/assets/synertec-logo.webp';

const tools = [
  {
    id: 'json-merge',
    name: 'JSON Data Merge',
    description: 'Merge CSV data into JSON templates with powerful placeholder support and transformation methods.',
    icon: Wand2,
    path: '/json-merge',
    status: 'available' as const,
  },
  // Future tools can be added here
];

const ToolSelector = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <img src={synertecLogo} alt="Synertec" className="h-12" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Synertec Tools</h1>
              <p className="text-muted-foreground mt-1">
                Productivity tools for data transformation and development workflows
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Available Tools</h2>
            <p className="text-muted-foreground">
              Select a tool to get started
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Link key={tool.id} to={tool.path} className="group">
                <Card className="h-full card-hover border-l-4 border-l-primary border-border hover:border-primary/50 bg-card overflow-hidden">
                  <CardHeader className="relative">
                    <div className="absolute inset-0 synertec-gradient-light opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-start justify-between">
                      <div className="p-3 rounded-xl synertec-gradient text-primary-foreground shadow-md">
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="relative mt-4 text-foreground">{tool.name}</CardTitle>
                    <CardDescription className="relative text-muted-foreground">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Placeholder for future tools */}
            <Card className="h-full border-2 border-dashed border-border opacity-60 bg-muted/30">
              <CardHeader>
                <div className="p-3 rounded-xl bg-muted w-fit">
                  <Wrench className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4 text-muted-foreground">More Coming Soon</CardTitle>
                <CardDescription>Additional tools are in development</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Synertec. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ToolSelector;
