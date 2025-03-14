
interface YouFormWidgetInterface {
  open: (formId: string, options?: { position?: 'center' | 'left' | 'right' }) => void;
  close: () => void;
}

declare global {
  interface Window {
    YouFormWidget?: YouFormWidgetInterface;
  }
}

export {};
