import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="json-editor"]',
    title: 'JSON Template',
    content: 'Start by pasting or uploading your JSON template. Use {{placeholders}} for dynamic values that will be replaced with CSV data.',
    position: 'right'
  },
  {
    target: '[data-tour="csv-editor"]',
    title: 'CSV Data',
    content: 'Add your CSV data here. Column headers become available as placeholders in your JSON template.',
    position: 'left'
  },
  {
    target: '[data-tour="placeholders"]',
    title: 'Placeholders',
    content: 'Detected placeholders appear here. System placeholders (SYS) like dates and UUIDs are built-in. Hover over date/time ones to set fixed values.',
    position: 'top'
  },
  {
    target: '[data-tour="array-mode"]',
    title: 'Array Mode',
    content: 'Toggle this to output a single JSON file with all rows in an array, instead of separate files per row.',
    position: 'bottom'
  },
  {
    target: '[data-tour="results"]',
    title: 'Merged Results',
    content: 'Your merged JSON output appears here. Download individual files or all at once as a ZIP.',
    position: 'top'
  }
];

interface GuidedTourProps {
  onComplete: () => void;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        const tooltipWidth = 320;
        const tooltipHeight = 180;
        const padding = 16;
        
        let top = 0;
        let left = 0;
        
        switch (step.position) {
          case 'top':
            top = rect.top - tooltipHeight - padding;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'bottom':
            top = rect.bottom + padding;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - padding;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + padding;
            break;
        }
        
        // Keep within viewport
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
        
        setPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
      
      {/* Spotlight */}
      {targetRect && (
        <div
          className="fixed z-50 rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-background transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px hsl(var(--background) / 0.8)'
          }}
        />
      )}
      
      {/* Tooltip */}
      <div
        className="fixed z-50 w-80 rounded-xl border bg-card p-4 shadow-2xl transition-all duration-300"
        style={{ top: position.top, left: position.left }}
      >
        <button
          onClick={onComplete}
          className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">{step.title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {step.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button size="sm" variant="ghost" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function useTour() {
  const [showTour, setShowTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem('json-merge-tour-completed') === 'true';
  });

  const startTour = () => setShowTour(true);
  
  const completeTour = () => {
    setShowTour(false);
    setHasSeenTour(true);
    localStorage.setItem('json-merge-tour-completed', 'true');
  };

  const resetTour = () => {
    localStorage.removeItem('json-merge-tour-completed');
    setHasSeenTour(false);
  };

  return { showTour, hasSeenTour, startTour, completeTour, resetTour };
}
