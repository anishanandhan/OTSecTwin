// ━━ PRIVACY-FIRST ANALYTICS & A/B TESTING ENGINE (LAYER 10) ━━

// Event buffer for local auditing and session analysis
const sessionEvents = [];

/**
 * Dispatches an event to Plausible Analytics (window.plausible) if present,
 * and maintains an in-memory session audit trail for developer inspection.
 */
export function trackEvent(eventName, props = {}) {
  const timestamp = new Date().toISOString();
  const eventPayload = {
    event: eventName,
    props: {
      ...props,
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      timestamp
    }
  };

  sessionEvents.push(eventPayload);

  // If Plausible is loaded on window
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(eventName, { props });
  }

  // Developer logging in debug mode
  if (process.env.NODE_ENV !== 'production' || window.location.search.includes('debug=true')) {
    console.log(`📊 [Analytics] ${eventName}`, props);
  }
}

/**
 * Retrieves recorded analytics events in the current session
 */
export function getSessionEvents() {
  return [...sessionEvents];
}

/**
 * Lightweight Zero-Dependency A/B Testing Engine (Layer 10 Spec)
 * Splits traffic 50/50 and persists choice across the visitor session.
 */
export function getABVariant(testName, variants = ['A', 'B']) {
  if (typeof window === 'undefined') return variants[0];

  const storageKey = `ab_test_${testName}`;
  let variant = sessionStorage.getItem(storageKey);

  if (!variant || !variants.includes(variant)) {
    variant = variants[Math.floor(Math.random() * variants.length)];
    sessionStorage.setItem(storageKey, variant);
    trackEvent('AB Test Enrolled', { test: testName, variant });
  }

  return variant;
}
