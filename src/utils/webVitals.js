/**
 * Web Vitals Configuration
 * Mesure et rapporte les Core Web Vitals pour l'optimisation de performance
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log(`📊 ${metric.name}: ${Math.round(metric.value)}ms`);
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

/**
 * Performance hints
 */
export function reportPerformanceMetrics() {
  if (!window.performance) return;

  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');

  if (navigation) {
    console.log('📈 Performance Metrics:');
    console.log(`  DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`);
    console.log(`  TCP Connection: ${Math.round(navigation.connectEnd - navigation.connectStart)}ms`);
    console.log(`  Time to First Byte: ${Math.round(navigation.responseStart - navigation.requestStart)}ms`);
    console.log(`  DOM Interactive: ${Math.round(navigation.domInteractive - navigation.fetchStart)}ms`);
    console.log(`  DOM Complete: ${Math.round(navigation.domComplete - navigation.fetchStart)}ms`);
  }

  paint.forEach((entry) => {
    console.log(`🎨 ${entry.name}: ${Math.round(entry.startTime)}ms`);
  });
}
