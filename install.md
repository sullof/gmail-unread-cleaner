# Installation Guide

## Quick Setup (5 minutes)

### Step 1: Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable Gmail API: APIs & Services → Library → Search "Gmail API" → Enable
4. Create OAuth2 credentials: APIs & Services → Credentials → Create Credentials → OAuth client ID → Chrome extension
5. Download the credentials JSON file and copy the "client_id" value from it

### Step 2: Load Extension in Chrome
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" → Select this project folder
4. **Copy the Extension ID** from the extensions list (looks like: `abcdefghijklmnop...`)

### Step 3: Complete OAuth Setup
1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add your Extension ID to "Authorized origins"
4. Update `manifest.json` with the Client ID:
   - Open the downloaded credentials JSON file
   - Copy the "client_id" value
   - Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` in `manifest.json` with your actual Client ID

### Step 4: Test the Extension
1. Click the extension icon in Chrome toolbar
2. Click "Connect to Gmail"
3. Authorize the extension
4. Select a folder and test the scan functionality

## Troubleshooting

### "Invalid client" error
- Make sure Extension ID is added to OAuth client authorized origins
- Verify Client ID is correctly set in manifest.json

### "Access denied" error
- Check that Gmail API is enabled in Google Cloud Console
- Verify OAuth scopes are correct

### Extension won't load
- Check Chrome console for errors (F12 → Console)
- Verify all files are present in the project directory

## Security Notes
- The extension only accesses Gmail data you explicitly authorize
- No data is stored locally beyond temporary authentication tokens
- All API calls go directly to Google's servers
- Preview mode is enabled by default for safety

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify all setup steps were completed
3. Try clearing browser cache and re-authenticating
