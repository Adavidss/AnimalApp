# 🦁 Animal Atlas

A production-ready wildlife encyclopedia web application built with React, TypeScript, and free public APIs. Explore detailed information about animals from around the world, including images, conservation status, geographic distribution, and more.

## ✨ Features

- **🔍 Smart Search**: Search for animals by common or scientific name with autocomplete suggestions
- **🎲 Random Animal**: Discover new animals with random selection
- **📅 Animal of the Day**: Daily featured animal with 24-hour caching
- **🗺️ Interactive Maps**: View native range and occurrence data using Leaflet and OpenStreetMap
- **📊 Detailed Information**:
  - Taxonomy classification (Kingdom to Species)
  - Physical characteristics (diet, lifespan, weight, habitat)
  - Conservation status from IUCN Red List
  - High-quality images from Unsplash
  - Wikipedia descriptions and articles
- **🔎 Advanced Filtering**: Filter by category, habitat, and endangered status
- **🌓 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive Design**: Mobile-first design works on all devices
- **⚡ Performance**:
  - LocalStorage caching for faster load times
  - Lazy loading images
  - Skeleton loaders for better UX
  - Rate limiting protection

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Maps**: Leaflet + OpenStreetMap
- **State Management**: React Context API
- **Data Sources**:
  - [API Ninjas](https://api-ninjas.com) - Animal facts and taxonomy
  - [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) - Descriptions and articles
  - [Unsplash API](https://unsplash.com/developers) - High-quality animal images
  - [GBIF API](https://www.gbif.org/developer/summary) - Species occurrences and distribution
  - [IUCN Red List API](https://apiv3.iucnredlist.org) - Conservation status

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- API keys (free to obtain):
  - [API Ninjas API Key](https://api-ninjas.com)
  - [Unsplash Access Key](https://unsplash.com/oauth/applications)
  - [IUCN Red List API Token](https://apiv3.iucnredlist.org/api/v3/token)

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Animal-App
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Add your API keys to `.env`**:
   ```env
   VITE_API_NINJAS_KEY=your_api_ninjas_key_here
   VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   VITE_IUCN_API_KEY=your_iucn_api_token_here
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 🔑 Getting API Keys

### API Ninjas (Required)
1. Visit [https://api-ninjas.com](https://api-ninjas.com)
2. Sign up for a free account
3. Navigate to "My Account" to get your API key
4. Free tier: 50,000 requests/month

### Unsplash (Required)
1. Visit [https://unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application
3. Copy the "Access Key"
4. Free tier: 50 requests/hour

### IUCN Red List (Required)
1. Visit [https://apiv3.iucnredlist.org/api/v3/token](https://apiv3.iucnredlist.org/api/v3/token)
2. Request a free API token
3. Check your email for the token
4. Free tier: 10,000 requests/day

**Note**: Wikipedia REST API and GBIF API do not require API keys.

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Type check
npx tsc --noEmit
```

### Project Structure

```
src/
├── api/                    # API integration layer
│   ├── animals.ts         # API Ninjas integration
│   ├── gbif.ts           # GBIF API for species data
│   ├── images.ts         # Unsplash API for images
│   ├── iucn.ts           # IUCN Red List API
│   └── wikipedia.ts      # Wikipedia REST API
├── components/            # Reusable UI components
│   ├── AnimalCard.tsx    # Animal display card
│   ├── AnimalGallery.tsx # Image carousel
│   ├── ErrorState.tsx    # Error handling UI
│   ├── Filters.tsx       # Category and habitat filters
│   ├── Loader.tsx        # Loading skeletons
│   ├── MapView.tsx       # Leaflet map component
│   └── SearchBar.tsx     # Search with autocomplete
├── context/              # Global state management
│   └── AnimalContext.tsx # Animal data context
├── pages/                # Page components
│   ├── Home.tsx         # Homepage with featured animals
│   ├── Explorer.tsx     # Filterable animal grid
│   └── AnimalDetail.tsx # Detailed animal view
├── routes/              # Routing configuration
│   └── AppRouter.tsx    # React Router setup
├── styles/              # Global styles
│   └── index.css        # Tailwind CSS + custom styles
├── types/               # TypeScript definitions
│   └── animal.ts        # Type interfaces
├── utils/               # Utility functions
│   ├── cache.ts         # LocalStorage caching
│   └── constants.ts     # API URLs and constants
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard:
   - `VITE_API_NINJAS_KEY`
   - `VITE_UNSPLASH_ACCESS_KEY`
   - `VITE_IUCN_API_KEY`

4. **Production deployment**:
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to Netlify

3. **Add environment variables** in Netlify dashboard

### Deploy to GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install -D gh-pages
   ```

2. **Update `vite.config.ts`**:
   ```typescript
   export default defineConfig({
     base: '/Animal-App/',
     // ... other config
   });
   ```

3. **Add deploy script to `package.json`**:
   ```json
   {
     "scripts": {
       "deploy": "vite build && gh-pages -d dist"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

## 🎨 Features Showcase

### Home Page
- Hero section with search bar
- "Random Animal" button for discovery
- "Animal of the Day" card (refreshed every 24 hours)
- Featured animals grid with conservation status badges

### Animal Detail Page
- Image gallery with Unsplash photos
- Tabbed interface:
  - **Overview**: Wikipedia description + characteristics
  - **Taxonomy**: Full classification (Kingdom → Species)
  - **Habitat & Range**: Interactive Leaflet map with occurrence markers
  - **Conservation**: IUCN status with population trends

### Explorer Page
- Filter by category: Mammal, Bird, Reptile, Amphibian, Fish
- Filter by habitat: Land, Ocean, Freshwater, Air
- Toggle "Endangered Only" filter
- Grid layout with pagination
- Search integration

## 🔧 Configuration

### Rate Limiting

API calls are rate-limited to prevent exceeding free tier limits:

```typescript
// src/utils/constants.ts
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 50,
  RETRY_DELAY_MS: 1000,
  MAX_RETRIES: 3,
};
```

### Caching

LocalStorage caching reduces API calls:

```typescript
export const CACHE_DURATION = {
  DAILY_ANIMAL: 24 * 60 * 60 * 1000,  // 24 hours
  ANIMAL_DATA: 60 * 60 * 1000,        // 1 hour
  SEARCH_RESULTS: 30 * 60 * 1000,     // 30 minutes
  WIKIPEDIA: 60 * 60 * 1000,          // 1 hour
};
```

### Map Configuration

```typescript
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20, 0] as [number, number],
  DEFAULT_ZOOM: 2,
  MAX_ZOOM: 18,
  MIN_ZOOM: 2,
};
```

## 🐛 Troubleshooting

### API Key Issues

**Error**: `401 Unauthorized` or `403 Forbidden`

**Solution**:
- Verify API keys are correctly added to `.env`
- Ensure `.env` variables start with `VITE_`
- Restart dev server after adding environment variables

### Unsplash Rate Limiting

**Error**: `429 Too Many Requests`

**Solution**:
- The app falls back to hardcoded fallback images
- Consider caching Unsplash responses longer
- Upgrade to Unsplash paid plan for higher limits

### CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution**:
- All APIs used support CORS for browser requests
- If using a custom proxy, ensure CORS headers are set
- Check browser console for specific API causing issue

### Map Not Loading

**Error**: Map tiles not displaying

**Solution**:
- Check internet connection (OpenStreetMap tiles require network)
- Verify Leaflet CSS is loaded in `index.html`
- Check browser console for 404 errors on tile requests

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **API Ninjas** for comprehensive animal data
- **Wikipedia** for detailed descriptions
- **Unsplash** for beautiful wildlife photography
- **GBIF** for species occurrence data
- **IUCN** for conservation status information
- **OpenStreetMap** for free map tiles

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and free public APIs**
