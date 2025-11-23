# Performance Features - Quick Reference

## Commands

### Bundle Analysis
```bash
npm run build              # Generates dist/stats.html
open dist/stats.html       # View bundle visualization
```

### PWA Testing
```bash
npm run build
npm run preview
# Open DevTools → Application → Service Workers
# Test offline mode in Network tab
```

### Route Prefetching
```bash
# Automatic - just hover over links!
# Or use programmatically:
```

```tsx
import { prefetchRoute } from "@/utils/prefetch";
prefetchRoute("/catalog");
```

## Quick Checks

### Is PWA Working?
1. Visit app in browser
2. Look for install prompt
3. Check "App ready to work offline" toast
4. Go offline → app still works

### Is Prefetch Working?
1. Open DevTools → Network tab
2. Hover over a link
3. See chunk download
4. Click link → instant navigation

### Is Bundle Optimized?
1. Build project
2. Open dist/stats.html
3. Check largest chunks
4. No chunk should be > 500KB

## Performance Targets

✅ Initial load: < 1.5s  
✅ Navigation: < 100ms  
✅ Lighthouse: 95+  
✅ PWA score: 100  
✅ Offline: Functional  

## Files Overview

- `vite.config.ts` - PWA & bundle config
- `src/utils/prefetch.ts` - Prefetch logic
- `src/hooks/usePWA.ts` - PWA lifecycle
- `src/components/NavLink.tsx` - Auto-prefetch links
- `ADVANCED_PERFORMANCE.md` - Full documentation
