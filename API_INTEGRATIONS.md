# API Integrations - Animal Atlas

This document lists all the APIs integrated into the Animal Atlas application, including which ones require API keys and which are free to use without authentication.

## Summary

**Total APIs Integrated:** 28
**APIs with Keys (Working):** 2 (The Dog API ✅ + eBird ✅)
**APIs Requiring Keys (Optional):** 4 (API Ninjas, Unsplash, IUCN, The Cat API)
**Free APIs (No Keys Required):** 22

## API Status Overview

### ✅ Working RIGHT NOW with Keys (2 APIs)

These APIs are already configured with working API keys:

1. **The Dog API** ⭐ PREMIUM - Comprehensive dog breeds database
   - Base URL: `https://api.thedogapi.com/v1`
   - Documentation: https://thedogapi.com/
   - **Status:** ✅ API KEY PROVIDED AND WORKING
   - Features: Dog breeds, images, temperament, characteristics
   - Free Tier: 10,000 requests/month
   - Why it's great: Most comprehensive dog breed database available

2. **eBird** - Bird sightings and observations
   - Base URL: `https://api.ebird.org/v2`
   - **Status:** ✅ API KEY WORKING
   - Features: Recent bird observations, species data

### ✅ Working Without Configuration (22 Free APIs)

These APIs are fully integrated and work without any API keys:

1. **iNaturalist API** - Species data, photos, and observations
   - Base URL: `https://api.inaturalist.org/v1`
   - Documentation: https://www.inaturalist.org/pages/api+reference
   - Features: Species search, observations, photos, geographic distribution

2. **Wikipedia REST API** - Article summaries and descriptions
   - Base URL: `https://en.wikipedia.org/api/rest_v1`
   - Features: Species summaries, descriptions, links

3. **GBIF (Global Biodiversity Information Facility)** - Species occurrences and distribution
   - Base URL: `https://api.gbif.org/v1`
   - Documentation: https://www.gbif.org/developer/summary
   - Features: Species taxonomy, geographic occurrences, distribution maps

4. **xeno-canto** - Animal and bird sound recordings
   - Base URL: `https://xeno-canto.org/api/2`
   - Features: Bird calls, animal sounds

5. **Movebank** - Animal migration tracking data
   - Base URL: `https://www.movebank.org/movebank/service/direct-read`
   - Features: Migration patterns, tracking data

6. **WoRMS (World Register of Marine Species)** - Marine species taxonomy
   - Base URL: `https://www.marinespecies.org/rest`
   - Features: Marine species names, taxonomy, distribution

7. **FishBase API** - Fish species data and ecology
   - Base URL: `https://fishbase.ropensci.org`
   - Documentation: https://ropensci.github.io/fishbaseapidocs/
   - Features: Fish species info, ecology, habitat, common names

8. **SeaLifeBase API** - Aquatic species data (non-fish)
   - Base URL: `https://fishbase.ropensci.org/sealifebase`
   - Features: Aquatic life data (invertebrates, etc.)

9. **Random Dog API** - Random dog images
   - Base URL: `https://random.dog`
   - Features: Random dog photos

10. **Cataas (Cat as a Service)** - Random cat images
    - Base URL: `https://cataas.com`
    - Features: Random cat photos

11. **Random Fox API** - Random fox images
    - Base URL: `https://randomfox.ca`
    - Features: Random fox photos

12. **Random Duck API** - Random duck images
    - Base URL: `https://random-d.uk/api`
    - Features: Random duck photos

13. **Cat Facts API** - Random cat facts
    - Base URL: `https://catfact.ninja`
    - Features: Interesting cat facts

14. **Dog Facts API** - Random dog facts
    - Base URL: `https://dog-api.kinduff.com/api/facts`
    - Features: Interesting dog facts

15. **Zoo Animal API** - Comprehensive zoo animal database
    - Base URL: `https://zoo-animal-api.herokuapp.com`
    - Documentation: https://zoo-animal-api.herokuapp.com/
    - Features: Random animals, animal details, Latin names, habitat info

16. **The Cat API** (Free tier) - Cat images without key
    - Base URL: `https://api.thecatapi.com/v1`
    - Features: Random cat images (limited without key)

17. **Shibe.online** - Shiba Inu, cats, and bird images
    - Base URL: `https://shibe.online/api`
    - Documentation: http://shibe.online/
    - Features: Random Shiba Inu, cat, and bird images

18. **Axolotl API** - Random axolotl images
    - Base URL: `https://theaxolotlapi.netlify.app`
    - Documentation: https://theaxolotlapi.netlify.app/
    - Features: Random axolotl images and facts

19. **FishWatch API (NOAA)** - US fish species data
    - Base URL: `https://www.fishwatch.gov/api`
    - Documentation: https://www.fishwatch.gov/developers
    - Features: US fish species, sustainability info, fishing data

20. **MeowFacts** - Random cat facts
    - Base URL: `https://meowfacts.herokuapp.com`
    - Features: Random cat facts

21. **PlaceBear** - Bear placeholder images
    - Base URL: `https://placebear.com`
    - Features: Bear images in any size

22. **PlaceDog** - Dog placeholder images
    - Base URL: `https://place.dog`
    - Features: Dog images in any size

23. **PlaceKitten** - Kitten placeholder images
    - Base URL: `https://placekitten.com`
    - Features: Kitten images in any size

### 🔑 Optional APIs (Require Keys - Enhanced Features)

These APIs require API keys but the app has fallbacks in place:

1. **The Dog API** ✅ WORKING - Comprehensive dog breeds database
   - Sign up: https://thedogapi.com/
   - Free Tier: 10,000 requests/month
   - **Status:** ✅ API KEY PROVIDED - ALREADY WORKING!
   - Features: Detailed breed info, high-quality images, temperament data
   - Why get your own key: Higher rate limits, custom analytics

2. **API Ninjas - Animals** (OPTIONAL)
   - Sign up: https://api-ninjas.com/register
   - Free Tier: 50,000 requests/month
   - Fallbacks: The Dog API, Zoo Animal API, iNaturalist, FishBase
   - Features: Comprehensive animal data, taxonomy, characteristics
   - Why get a key: More detailed species information, faster response times

3. **Unsplash** (OPTIONAL)
   - Sign up: https://unsplash.com/oauth/applications
   - Free Tier: 50 requests/hour
   - Fallbacks: The Dog API, The Cat API, Shibe.online, iNaturalist, Random animal APIs
   - Features: High-quality professional animal photography
   - Why get a key: Better image quality, more variety

4. **IUCN Red List** (OPTIONAL)
   - Request token: https://apiv3.iucnredlist.org/api/v3/token
   - Free Tier: 10,000 requests/day
   - Fallbacks: None (conservation status won't be shown)
   - Features: Official conservation status, threat information
   - Why get a key: Conservation status badges, threat assessments

5. **The Cat API** (OPTIONAL)
   - Sign up: https://thecatapi.com/
   - Free Tier: 10,000 requests/month
   - Fallbacks: Shibe.online, Cataas, Random cat APIs
   - Features: Detailed cat breed info, high-quality images, temperament data
   - Why get a key: Access to breed information, higher quality images

6. **eBird** ✅ WORKING - Bird sightings
   - Sign up: https://ebird.org/api/keygen
   - Free Tier: Unlimited (rate limited)
   - Current Key: `t7us9fd3bci3`
   - Features: Bird sightings, recent observations
   - Note: You can use the existing key or get your own

## How API Fallbacks Work

The app uses a smart fallback system:

### Animal Data Fetching
1. **First Try:** API Ninjas (if key provided)
2. **Fallback 1:** FishBase (for fish species)
3. **Fallback 2:** The Dog API ✅ (for dog breeds - KEY PROVIDED!)
4. **Fallback 3:** Zoo Animal API (general animals)
5. **Fallback 4:** iNaturalist (for all species)

### Image Fetching
1. **First Try:** Unsplash (if key provided)
2. **Fallback 1:** The Dog API ✅ (for dogs - KEY PROVIDED!)
3. **Fallback 2:** The Cat API (for cats - if key provided)
4. **Fallback 3:** Shibe.online (for Shiba Inu, dogs, birds)
5. **Fallback 4:** iNaturalist photos
6. **Fallback 5:** Random animal APIs (for dogs, cats, foxes, ducks)
7. **Fallback 6:** Placeholder APIs (PlaceBear, PlaceDog, PlaceKitten)
8. **Final Fallback:** Static fallback images

## Setting Up API Keys (Optional)

To use the premium APIs, follow these steps:

### 1. API Ninjas

```bash
# 1. Go to https://api-ninjas.com/register
# 2. Sign up for a free account
# 3. Get your API key from the dashboard
# 4. Add to .env file:
VITE_API_NINJAS_KEY=your_actual_api_key_here
```

### 2. Unsplash

```bash
# 1. Go to https://unsplash.com/oauth/applications
# 2. Create a new application
# 3. Get your Access Key
# 4. Add to .env file:
VITE_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
```

### 3. IUCN Red List

```bash
# 1. Go to https://apiv3.iucnredlist.org/api/v3/token
# 2. Request a token (may take 1-2 business days)
# 3. Add to .env file:
VITE_IUCN_API_KEY=your_actual_token_here
```

### 4. eBird (Optional - already configured)

```bash
# Already has a working key: t7us9fd3bci3
# If you want your own:
# 1. Go to https://ebird.org/api/keygen
# 2. Get your API key
# 3. Replace in .env file:
VITE_EBIRD_API_KEY=your_actual_api_key_here
```

## Testing the App

The app will now work without any API keys! You can test it immediately:

```bash
npm run dev
```

## API Integration Details

### New API Files Created

1. `/src/api/inaturalist.ts` - iNaturalist integration
   - Species search
   - Observations
   - Photos
   - Geographic distribution

2. `/src/api/randomAnimals.ts` - Random animal image APIs
   - Dog, cat, fox, duck images
   - Cat and dog facts

3. `/src/api/fishbase.ts` - FishBase integration
   - Fish species search
   - Ecology data
   - Common names
   - SeaLifeBase integration

### New Files Created

1. `/src/api/theDogApi.ts` - The Dog API integration (premium features)
2. `/src/api/additionalApis.ts` - Zoo Animal, The Cat API, Shibe, Axolotl, FishWatch
3. `/src/api/inaturalist.ts` - iNaturalist integration
4. `/src/api/randomAnimals.ts` - Random animal image APIs
5. `/src/api/fishbase.ts` - FishBase integration
6. `/src/vite-env.d.ts` - TypeScript environment types

### Modified Files

1. `/src/api/animals.ts` - Added multi-level fallback logic
2. `/src/api/images.ts` - Added comprehensive image fallback system
3. `/src/context/AnimalContext.tsx` - Integrated all new API data
4. `/src/utils/constants.ts` - Added 10+ new API URLs
5. `/src/types/animal.ts` - Added new type definitions
6. `.env` - Updated with The Dog API key and documentation

## Why You Should Still Get API Keys

While the app works without keys, here are benefits of getting them:

### API Ninjas Key Benefits
- More comprehensive animal data
- Better taxonomy information
- Faster response times
- Higher data quality
- Support for more species

### Unsplash Key Benefits
- Professional photography
- Higher resolution images
- Better image variety
- Proper attribution
- Consistent quality

### IUCN Key Benefits
- Official conservation status
- Threat assessments
- Population trends
- Conservation measures
- Scientific credibility

## Rate Limits

**Free APIs (No Authentication):**
- Generally unlimited or very high limits
- Some may have rate limiting (handled gracefully)

**APIs with Keys:**
- API Ninjas: 50,000 requests/month
- Unsplash: 50 requests/hour
- IUCN: 10,000 requests/day
- eBird: Unlimited (rate limited)

## Troubleshooting

### Issue: "Animal Not Found"

**Solution:** The app will now automatically try multiple APIs. If you still see this:
1. Check your internet connection
2. The species might not be in any database
3. Try a different species name

### Issue: "Failed to load animal"

**Solution:**
1. All free APIs might be down (rare)
2. Network connectivity issue
3. Try refreshing the page

### Issue: Images not loading

**Solution:**
1. Fallback images should load automatically
2. Check browser console for errors
3. Some species might not have photos in free databases

## API Credits & Attribution

- **iNaturalist:** Community-contributed data
- **GBIF:** International biodiversity data
- **FishBase/SeaLifeBase:** rOpenSci
- **Wikipedia:** Wikimedia Foundation
- **xeno-canto:** Community bird recordings
- **Movebank:** Max Planck Institute
- **WoRMS:** World Register of Marine Species
- **Random Animal APIs:** Community projects

## Future API Integrations

Potential APIs to add:
- Catalog of Life
- Encyclopedia of Life (EOL)
- Animal Diversity Web
- ZooBank
- Plazi TreatmentBank
