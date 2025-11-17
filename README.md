# Trading Journal Frontend

A complete React TypeScript frontend for a Trading Journal web application. This app focuses on fast logging, emotion tracking, visualizations, AI insights, and offline-first functionality.

## Features

- **Quick Trade Logging**: Create trades in under 30 seconds with minimal required fields
- **Emotion Tracking**: Track pre-entry and post-exit emotions with visual picker
- **Dashboard Analytics**: View KPIs (Win Rate, Avg P/L, Expectancy) and charts
- **AI Insights**: Get behavioral pattern analysis and trading recommendations
- **Decision Graph**: Visualize trade decision flow with interactive graph
- **Offline-First**: All writes persist locally and sync when online
- **CSV Import/Export**: Import trades from CSV and export data as JSON
- **Settings Management**: Configure risk limits and pre-trade checklists

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Redux Toolkit + RTK Query
- **Offline Storage**: localForage (IndexedDB)
- **Forms**: react-hook-form + Zod validation
- **Charts**: Recharts
- **Graph Visualization**: react-flow-renderer
- **API Mocking**: MSW (Mock Service Worker)
- **Testing**: Jest + React Testing Library

## Project Structure

```
src/
├── api/                 # RTK Query API slices
│   └── apiSlice.ts
├── app/                 # Redux store and providers
│   ├── store.ts
│   └── hooks.ts
├── components/          # Reusable components
│   ├── TradeCard.tsx
│   ├── TradeList.tsx
│   ├── LogTradeModal.tsx
│   ├── EmotionPicker.tsx
│   ├── ConvictionSlider.tsx
│   ├── Dashboard.tsx
│   ├── InsightCard.tsx
│   ├── DecisionGraph.tsx
│   ├── ScreenshotUploader.tsx
│   └── OfflineSyncNotice.tsx
├── features/           # Redux feature slices
│   ├── trades/
│   ├── auth/
│   └── ui/
├── pages/              # Page components
│   ├── index.tsx       # Dashboard
│   ├── trade/[id].tsx  # Trade detail
│   ├── log.tsx         # Quick log
│   ├── settings.tsx
│   └── import.tsx
├── utils/              # Utility functions
│   ├── validators.ts
│   ├── localSync.ts
│   ├── helpers.ts
│   └── sampleData.ts
├── mocks/              # MSW mock handlers
│   ├── handlers.ts
│   └── browser.ts
├── styles/
│   └── index.css
├── types.ts            # TypeScript type definitions
├── routes.tsx          # React Router configuration
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Development

### Running Tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## API Integration

### Mock Server (MSW)

The app uses MSW (Mock Service Worker) to mock API endpoints in development. All API calls are intercepted and return mock data from `src/mocks/handlers.ts`.

**Note**: If the mock service worker file is missing, run:
```bash
npx msw init public/ --save
```

This will generate the `public/mockServiceWorker.js` file needed for MSW to work.

### Replacing Mock Endpoints

To connect to a real backend:

1. Update `VITE_API_BASE_URL` in `.env` to point to your backend
2. Remove or disable MSW in `src/main.tsx`:

```typescript
// Comment out or remove this:
async function enableMocking() {
  // ...
}
```

3. Ensure your backend implements the following endpoints:

#### Required Endpoints

- `GET /api/trades` - List all trades
- `GET /api/trades/:id` - Get trade by ID
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `POST /api/trades/:id/journal` - Add journal entry
- `POST /api/upload` - Upload image (returns `{ url: string }`)
- `POST /api/ai/analyze` - Analyze trades (returns `AIAnalysisResponse`)
- `POST /api/ai/parse` - Parse decision graph (returns `DecisionGraph`)
- `GET /api/trades/:id/similar` - Get similar trades

### API Contract

See `src/types.ts` for TypeScript interfaces matching the API contract.

## Offline-First Architecture

The app implements offline-first behavior:

1. **Local Storage**: All writes go to localForage (IndexedDB) first
2. **Optimistic Updates**: UI updates immediately for better UX
3. **Sync Queue**: Failed API calls are queued for retry
4. **Auto-Sync**: When the app comes back online, queued items are automatically synced
5. **Manual Sync**: Users can manually trigger sync via the OfflineSyncNotice component

### Offline Queue

The sync queue is managed by `src/utils/localSync.ts`:

- Items are stored in IndexedDB
- Retries up to 3 times before giving up
- Automatically flushes when online
- Can be manually triggered

## Key Components

### LogTradeModal

Quick trade entry form with:
- Minimal required fields (instrument, direction, entry price, size, time)
- Emotion picker for pre-entry emotions
- Conviction slider (1-10)
- Auto-saves to local storage
- Optimistic UI updates

### Dashboard

Main analytics page showing:
- KPIs: Win Rate, Avg P/L, Total Trades, Expectancy, Avg Conviction
- P/L over time chart (cumulative)
- Emotions vs P/L heatmap
- AI Insights cards (generated on demand)

### TradeDetailPage

Full trade view with:
- Trade metadata and P/L
- Pre/post journals
- Emotion timeline
- Screenshot gallery
- Decision graph visualization
- AI analysis
- Similar trades widget

### DecisionGraph

Interactive graph showing:
- Trade decision flow (trigger → emotion → belief → action → outcome)
- Click nodes to navigate to related trades
- AI-powered parsing from journal text
- Mock graph generation for development

## Sample Data

The app includes 10 sample trades in `src/utils/sampleData.ts` demonstrating:
- Win/loss scenarios
- Various emotions (FOMO, confidence, fear, etc.)
- Different conviction levels
- Common trading patterns

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AI_KEY=your-ai-key-here
```

## Testing

Test files are located alongside their source files:

- `src/features/trades/tradesSlice.test.ts` - Redux slice tests
- `src/components/LogTradeModal.test.tsx` - Component tests
- `src/utils/helpers.test.ts` - Utility function tests

Add more tests following the existing patterns.

## Accessibility

The app includes basic accessibility features:

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Semantic HTML structure

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires IndexedDB support for offline functionality.

## Troubleshooting

### MSW Not Working

If API calls aren't being mocked:

1. Ensure `public/mockServiceWorker.js` exists
2. Check browser console for MSW registration
3. Verify MSW is enabled in development mode

### Offline Sync Not Working

1. Check browser IndexedDB support
2. Verify `localforage` is properly initialized
3. Check browser console for sync errors

### Build Errors

1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check TypeScript errors: `npm run build`

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Write tests for new features
4. Follow the existing naming conventions
5. Update this README for significant changes

## License

MIT

## Next Steps

To connect to a real backend:

1. Implement backend API endpoints matching the contract
2. Update environment variables
3. Disable MSW in production
4. Add authentication if needed
5. Configure CORS on backend
6. Set up error handling and retry logic
7. Add real AI integration for insights

For AI integration, you can use the example serverless function structure (commented in handlers) to call OpenAI or similar services.

# LearnTradePyco
# LearnTradePyco
