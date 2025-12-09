import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { systemPlaceholders, userInputPlaceholders, rowInputPlaceholders } from '@/lib/systemPlaceholders';
import { placeholderMethods } from '@/lib/placeholderMethods';

export function PlaceholderHelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Placeholder Reference
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* How to Use */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">How to Use Placeholders</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Type <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{{'}</code> in the JSON editor to open autocomplete. 
                Placeholders are replaced with values during merge.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                <div className="text-muted-foreground">{'// Example'}</div>
                <div>{'{'}</div>
                <div className="pl-4">"name": "<span className="text-primary">{'{{name}}'}</span>",</div>
                <div className="pl-4">"email": "<span className="text-primary">{'{{email.toLowerCase()}}'}</span>"</div>
                <div>{'}'}</div>
              </div>
            </section>

            {/* CSV Column Placeholders */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                CSV Column Placeholders
                <Badge variant="secondary" className="text-xs">Dynamic</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Use column headers from your CSV file. Each row creates a separate output with its values.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                <span className="text-primary">{'{{columnName}}'}</span> → Value from that CSV column
              </div>
            </section>

            {/* System Placeholders */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                System Placeholders
                <Badge variant="outline" className="text-xs">Auto-generated</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Built-in values generated automatically during merge.
              </p>
              <div className="space-y-1.5">
                {systemPlaceholders.map(p => (
                  <div key={p.name} className="flex items-start gap-3 bg-muted/30 rounded px-3 py-2">
                    <code className="font-mono text-xs text-primary whitespace-nowrap">{`{{${p.name}}}`}</code>
                    <span className="text-xs text-muted-foreground">{p.description}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* User Input Placeholders */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                User Input Placeholders
                <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">Same for all rows</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Values you enter once that apply to every output row.
              </p>
              <div className="space-y-1.5">
                {userInputPlaceholders.map(p => (
                  <div key={p.name} className="flex items-start gap-3 bg-muted/30 rounded px-3 py-2">
                    <code className="font-mono text-xs text-primary whitespace-nowrap">{`{{${p.name}}}`}</code>
                    <span className="text-xs text-muted-foreground">{p.description} ({p.type})</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Row Input Placeholders */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                Row Input Placeholders
                <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">Array only</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Values you enter separately for each CSV row. <strong>Must be placed inside JSON arrays.</strong>
              </p>
              <div className="space-y-1.5">
                {rowInputPlaceholders.map(p => (
                  <div key={p.name} className="flex items-start gap-3 bg-muted/30 rounded px-3 py-2">
                    <code className="font-mono text-xs text-primary whitespace-nowrap">{`{{${p.name}}}`}</code>
                    <span className="text-xs text-muted-foreground">{p.description} ({p.type})</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200">
                <strong>Note:</strong> Row inputs only appear in autocomplete when your cursor is inside an array <code className="bg-muted px-1 rounded">[...]</code>
              </div>
            </section>

            {/* Methods */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                Placeholder Methods
                <Badge variant="secondary" className="text-xs">Chainable</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Transform values by adding methods after a dot. Type <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">.</code> after a placeholder name for suggestions.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs mb-3">
                <span className="text-primary">{'{{name.toUpperCase()}}'}</span> → JOHN DOE<br/>
                <span className="text-primary">{'{{email.slugify().toLowerCase()}}'}</span> → john-doe-example-com
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(placeholderMethods).map(([key, method]) => (
                  <div key={key} className="flex items-center gap-2 bg-muted/30 rounded px-3 py-1.5">
                    <code className="font-mono text-xs text-primary">.{key}()</code>
                    <span className="text-xs text-muted-foreground truncate">{method.description}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Number Placeholders */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">Number Placeholders</h3>
              <p className="text-sm text-muted-foreground mb-2">
                To output a value as a JSON number (without quotes), use <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">userInputNumber</code> or <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">rowInputNumber</code>.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                <div>"count": <span className="text-primary">{'{{userInputNumber}}'}</span></div>
                <div className="text-muted-foreground mt-1">→ "count": 42 (no quotes)</div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
