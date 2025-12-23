# Performance CI/CD

## Automated Lighthouse Audits

This project uses automated Lighthouse CI audits to track and enforce performance budgets on every pull request and push to main.

## 🎯 Performance Budgets

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: ≤ 2.5s
- **Cumulative Layout Shift (CLS)**: ≤ 0.1
- **Total Blocking Time (TBT)**: ≤ 300ms
- **First Contentful Paint (FCP)**: ≤ 2s
- **Speed Index**: ≤ 3s

### Lighthouse Scores
- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90
- **SEO**: ≥ 95
- **PWA**: ≥ 80 (warning only)

### Resource Budgets
- **JavaScript**: ≤ 300 KB
- **CSS**: ≤ 50 KB
- **Images**: ≤ 500 KB
- **Total Resources**: ≤ 1 MB

## 🚀 How It Works

### 1. Automated Testing
The GitHub Actions workflow runs on:
- Every pull request to `main`
- Every push to `main`

### 2. Test Coverage
Audits are run on key pages:
- Homepage (`/`)
- Catalog page (`/catalog`)
- About page (`/about`)

Each URL is tested 3 times to ensure consistent results.

### 3. Results
- **Passing**: All metrics meet the defined budgets
- **Warning**: Some metrics need attention but don't fail the build
- **Error**: Critical metrics exceed budgets and fail the build

## 📊 Viewing Results

### In Pull Requests
1. Check the "Lighthouse CI" GitHub Action
2. View the automated comment with score breakdown
3. Click the temporary public storage link for detailed reports

### In GitHub Actions
1. Go to the "Actions" tab in your repository
2. Click on a workflow run
3. View the "Run Lighthouse CI" step for detailed output

## 🔧 Configuration

### Adjusting Budgets
Edit `lighthouserc.json` to modify:
- Performance thresholds
- Resource size limits
- Tested URLs

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }]
      }
    }
  }
}
```

### Testing Additional Routes
Add more URLs to the `url` array in `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:4173",
        "http://localhost:4173/catalog",
        "http://localhost:4173/pricing",
        "http://localhost:4173/blog"
      ]
    }
  }
}
```

## 🛠️ Local Testing

Run Lighthouse CI locally before pushing:

```bash
# Install Lighthouse CI globally
npm install -g @lhci/cli

# Build the project
npm run build

# Run Lighthouse CI
lhci autorun
```

Or use the npm script:

```bash
npm run lighthouse
```

## 📈 Performance Monitoring

### Tracking Over Time
1. Enable Lighthouse CI Server for historical data
2. Compare results across branches and commits
3. Set up alerts for performance regressions

### Key Metrics to Watch
- **Bundle Size Trends**: Monitor JavaScript and CSS growth
- **Image Optimization**: Track image size reductions
- **Core Web Vitals**: Ensure consistent good user experience
- **Accessibility Score**: Maintain inclusive design

## 🎯 Best Practices

### Before Committing
1. Run local Lighthouse audits
2. Check bundle size with `npm run build`
3. Review the bundle visualizer at `dist/stats.html`

### When Audits Fail
1. Review the detailed Lighthouse report
2. Identify the failing metrics
3. Use performance tools:
   - Bundle analyzer for JavaScript issues
   - Network tab for resource loading
   - Performance tab for runtime issues

### Maintaining Performance
- Add new routes to CI configuration
- Update budgets as the app grows
- Regularly review and optimize:
  - Code splitting strategy
  - Image optimization
  - Third-party script impact
  - CSS delivery

## 📝 GitHub Secrets Required

For the CI to work, add these secrets to your GitHub repository:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Navigate to: Settings → Secrets and variables → Actions → New repository secret

## 🔍 Troubleshooting

### CI Fails to Build
- Check that all environment variables are set
- Verify Node.js version compatibility
- Review build logs for errors

### Inconsistent Scores
- Lighthouse runs 3 times by default for consistency
- Server/network conditions can affect results
- Focus on trends rather than individual scores

### Budget Too Strict
- Adjust thresholds in `lighthouserc.json`
- Use "warn" instead of "error" for less critical metrics
- Consider different budgets for different routes

## 📚 Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Performance Budgets Guide](https://web.dev/performance-budgets-101/)
