export const trackEvent = (eventName: string, properties: any = {}) => {
  console.log(`[Event Tracked]: ${eventName}`, properties);
  
  // In a real app, this would send to Segment, Mixpanel, or custom Firebase collection
  // For ZenFinance, we log to a dedicated analytics collection for the "Scaler" mission
  // addDoc(collection(db, 'analytics'), { eventName, properties, timestamp: serverTimestamp() });
};

export const ZenEvents = {
  ONBOARDING_COMPLETE: 'ONBOARDING_COMPLETE',
  EXPENSE_IMPORTED: 'EXPENSE_IMPORTED',
  SUBSCRIPTION_ANALYZED: 'SUBSCRIPTION_ANALYZED',
  CANCELLATION_GENERATED: 'CANCELLATION_GENERATED',
} as const;

export type ZenEvent = keyof typeof ZenEvents;
