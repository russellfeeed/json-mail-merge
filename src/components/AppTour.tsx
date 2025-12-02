import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const tourSteps: Step[] = [
  {
    target: '[data-tour="json-editor"]',
    content: 'Start by adding your JSON template here. Use {{placeholders}} for values you want to replace with CSV data.',
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[data-tour="csv-editor"]',
    content: 'Paste or upload your CSV data. Column headers should match your placeholder names.',
    placement: 'right',
  },
  {
    target: '[data-tour="array-mode"]',
    content: 'Enable Array Mode to combine all CSV rows into a single JSON array instead of separate files.',
    placement: 'left',
  },
  {
    target: '[data-tour="merge-status"]',
    content: 'This shows your current progress. All indicators turn green when ready to merge.',
    placement: 'left',
  },
  {
    target: '[data-tour="results"]',
    content: 'Your merged JSON files appear here. Download them individually or all at once.',
    placement: 'left',
  },
  {
    target: '[data-tour="load-example"]',
    content: 'Click here to load sample data and see how everything works!',
    placement: 'bottom',
  },
];

const TOUR_STORAGE_KEY = 'json-merge-tour-completed';

export const AppTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasCompletedTour) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setRun(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--card))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '16px',
        },
        buttonNext: {
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
};
