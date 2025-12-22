import { Link } from 'react-router-dom';
import { Wand2, Wrench, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Developer Toolkit</h1>
              <p className="text-sm text-muted-foreground">
                A collection of useful development tools
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Available Tools</h2>
            <p className="text-muted-foreground">
              Select a tool to get started
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Link key={tool.id} to={tool.path} className="group">
                <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="mt-4">{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Placeholder for future tools */}
            <Card className="h-full border-dashed opacity-50">
              <CardHeader>
                <div className="p-2 rounded-lg bg-muted w-fit">
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
    </div>
  );
};

export default ToolSelector;
