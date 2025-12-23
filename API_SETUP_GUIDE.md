# 🔑 API Setup Guide - Animal Atlas

## ⚠️ CRITICAL: Why Your App Isn't Working

Your Animal Atlas app requires **3 essential API keys** to function. Currently, your `.env` file has placeholder values (`your_key_here`), which is why you're seeing errors and no data.

---

## 🚨 Required API Keys (App won't work without these)

### 1. API Ninjas - Animal Facts & Taxonomy
**Current Status**: ❌ NOT CONFIGURED
**Free Tier**: 50,000 requests/month
**Setup Time**: ~2 minutes

**Steps to get your API key**:
1. Visit [https://api-ninjas.com/register](https://api-ninjas.com/register)
2. Sign up with your email (it's free!)
3. Verify your email
4. Go to "My Account" page
5. Copy your API key
6. Paste it in `.env` file:
   ```
   VITE_API_NINJAS_KEY=your_actual_key_from_api_ninjas
   ```

---

### 2. Unsplash - High-Quality Animal Images
**Current Status**: ❌ NOT CONFIGURED
**Free Tier**: 50 requests/hour
**Setup Time**: ~3 minutes

**Steps to get your API key**:
1. Visit [https://unsplash.com/developers](https://unsplash.com/developers)
2. Click "Register as a developer"
3. Accept the terms
4. Click "Your apps" → "New Application"
5. Accept the guidelines
6. Give your app a name (e.g., "Animal Atlas")
7. Copy the "Access Key"
8. Paste it in `.env` file:
   ```
   VITE_UNSPLASH_ACCESS_KEY=your_actual_access_key
   ```

---

### 3. IUCN Red List - Conservation Status
**Current Status**: ❌ NOT CONFIGURED
**Free Tier**: 10,000 requests/day
**Setup Time**: ~5 minutes (email verification required)

**Steps to get your API token**:
1. Visit [https://apiv3.iucnredlist.org/api/v3/token](https://apiv3.iucnredlist.org/api/v3/token)
2. Fill out the form with:
   - Your name
   - Your email
   - Organization: "Personal" or "Student"
   - Purpose: "Educational/Personal Project"
3. Submit the form
4. Check your email inbox (may take a few minutes)
5. Copy the token from the email
6. Paste it in `.env` file:
   ```
   VITE_IUCN_API_KEY=your_token_from_email
   ```

---

## ✅ Optional API Keys (Enhance features)

### 4. eBird - Bird Sightings
**Current Status**: ✅ CONFIGURED (t7us9fd3bci3)
**Free Tier**: Unlimited (rate limited)
**Already added to your `.env` file!**

If you want to get your own key:
1. Visit [https://ebird.org/api/keygen](https://ebird.org/api/keygen)
2. Fill out the form
3. Receive key instantly
4. Replace in `.env`:
   ```
   VITE_EBIRD_API_KEY=your_ebird_key
   ```

---

## 🆓 APIs That Don't Need Keys (Already Working!)

These APIs work automatically with no configuration:

✅ **Wikipedia REST API** - Article summaries
✅ **GBIF API** - Species distribution data
✅ **xeno-canto API** - Animal sound recordings
✅ **Movebank API** - Migration tracking
✅ **WoRMS API** - Marine species data

---

## 🚀 Quick Setup (5 Minutes)

Follow these steps in order:

1. **Stop the development server** (press Ctrl+C in terminal)

2. **Open `.env` file** in your text editor

3. **Replace the 3 placeholder values** with your actual API keys:
   ```env
   VITE_API_NINJAS_KEY=abc123your_actual_key_here
   VITE_UNSPLASH_ACCESS_KEY=xyz789your_actual_key_here
   VITE_IUCN_API_KEY=token456your_actual_token_here
   ```

4. **Save the `.env` file**

5. **Restart the development server**:
   ```bash
   npm run dev
   ```

6. **Open** http://localhost:3000/ in your browser

7. **Test** by searching for an animal (e.g., "Lion" or "Eagle")

---

## ✨ What You'll See After Setup

Once you've added the 3 required API keys, your Animal Atlas will display:

### On Any Animal Page:
- ✅ **Animal Facts** - diet, habitat, lifespan, etc. (API Ninjas)
- ✅ **Beautiful Images** - professional wildlife photos (Unsplash)
- ✅ **Conservation Status** - IUCN Red List category (IUCN)
- ✅ **Wikipedia Description** - detailed information (Wikipedia)
- ✅ **Distribution Map** - where the species lives (GBIF)
- ✅ **Full Taxonomy** - kingdom to species (API Ninjas)

### NEW FEATURES (Added by me):
- 🔊 **Animal Sounds** - recordings & sonograms (xeno-canto)
- 📍 **Migration Tracking** - GPS routes (Movebank)
- 🐦 **Bird Sightings** - recent observations (eBird)
- 🐠 **Marine Data** - ocean species info (WoRMS)

---

## 🔍 Verification Checklist

After adding your keys, verify they work:

| API | Test | Expected Result |
|-----|------|----------------|
| **API Ninjas** | Search "Lion" | Should show diet, habitat, lifespan |
| **Unsplash** | View any animal | Should show 6 quality images |
| **IUCN** | View endangered species | Should show red/orange conservation badge |
| **eBird** | View a bird species | Should show recent sightings |

---

## ❌ Common Errors & Solutions

### Error: "Failed to fetch animal data"
**Cause**: Invalid API Ninjas key
**Fix**: Double-check your API key from api-ninjas.com

### Error: "401 Unauthorized" in console
**Cause**: Invalid Unsplash key
**Fix**: Make sure you copied the "Access Key", not "Secret Key"

### Error: "No images found"
**Cause**: Unsplash rate limit (50/hour) exceeded
**Fix**: Wait an hour, or the app will use fallback images

### Error: "Conservation data unavailable"
**Cause**: IUCN token not configured
**Fix**: Check your email for the token

### App still showing placeholder data
**Cause**: Didn't restart server after updating `.env`
**Fix**: Stop server (Ctrl+C) and run `npm run dev` again

---

## 📊 API Usage Tracking

### Free Tier Limits:
- **API Ninjas**: 50,000/month (~1,666/day) ✅ Very generous
- **Unsplash**: 50/hour (~1,200/day) ⚠️ Can hit limit with heavy use
- **IUCN**: 10,000/day ✅ More than enough
- **eBird**: Unlimited (rate limited) ✅ No worries

### Tips to Stay Under Limits:
- App caches responses automatically
- Animal of the Day refreshes only once/24hrs
- Unsplash has fallback images if limit reached
- GBIF, Wikipedia, xeno-canto, Movebank, WoRMS have no limits!

---

## 🆘 Still Having Issues?

If you've added all 3 required API keys and still see errors:

1. **Check browser console** (F12) for specific error messages
2. **Verify `.env` format**:
   - No spaces around `=` sign
   - No quotes around keys
   - Keys start with `VITE_`
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Restart server** completely:
   ```bash
   # Kill all node processes
   pkill node
   # Start fresh
   npm run dev
   ```

---

## 📝 Your Current `.env` Status

```env
VITE_API_NINJAS_KEY=your_key_here           ❌ NEEDS UPDATING
VITE_UNSPLASH_ACCESS_KEY=your_key_here      ❌ NEEDS UPDATING
VITE_IUCN_API_KEY=your_key_here             ❌ NEEDS UPDATING
VITE_EBIRD_API_KEY=t7us9fd3bci3             ✅ CONFIGURED
```

---

## 🎯 Summary

**To make your app work RIGHT NOW**:

1. Get 3 free API keys (takes 10 minutes total)
2. Update your `.env` file
3. Restart the server
4. Enjoy your fully functional Animal Atlas!

**No credit card required. All APIs are 100% free for personal use.**

---

**Need help?** Check the error messages in your browser console (F12) for specific issues.
