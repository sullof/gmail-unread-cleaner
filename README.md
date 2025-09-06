# Gmail Unread Cleaner

A Chrome extension that helps you clean up unread messages in Gmail folders older than a specified date.

## Features

- 🔐 Secure Gmail API integration with OAuth2
- 📁 Select any Gmail folder/label to clean
- 📅 Filter messages by date (older than specified date)
- 👀 Preview mode to see what will be deleted
- 🗑️ Batch delete functionality with confirmation
- 📊 Detailed scan results and message preview

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth2 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Chrome extension" as the application type
   - Enter your extension ID (you'll get this after loading the extension)
   - Download the credentials JSON file

### 2. Configure the Extension

1. Update `manifest.json`:
   - Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your actual client ID from the Google Cloud Console

### 3. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this project directory
4. The extension will appear in your extensions list

### 4. Get Your Extension ID

1. After loading the extension, you'll see it in the extensions list
2. Copy the "ID" field (looks like: `abcdefghijklmnopqrstuvwxyzabcdef`)
3. Go back to Google Cloud Console > Credentials
4. Edit your OAuth client and add this ID to the "Authorized origins"

## Usage

1. Click the extension icon in your Chrome toolbar
2. Click "Connect to Gmail" to authenticate
3. Select the folder/label you want to clean
4. Choose a date (messages older than this date will be deleted)
5. Enable "Preview mode" to see what will be deleted without actually deleting
6. Click "Scan Messages" to see the results
7. If satisfied, disable preview mode and click "Delete Messages"

## Security & Privacy

- The extension only requests the minimum required Gmail permissions
- All authentication is handled securely through Google's OAuth2
- Your credentials are never stored locally
- The extension only accesses Gmail data you explicitly authorize

## Permissions

- `storage`: Store user preferences
- `identity`: Handle OAuth2 authentication
- `https://www.googleapis.com/*`: Access Gmail API
- `https://mail.google.com/*`: Integration with Gmail interface

## Development

### Project Structure

```
gmail-unread-cleaner/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Content script for Gmail integration
├── icons/                 # Extension icons
└── README.md              # This file
```

### Building

```bash
# Install dependencies
pnpm install

# Package the extension
pnpm run package
```

## Troubleshooting

### Authentication Issues
- Make sure your OAuth client ID is correctly configured
- Verify the extension ID is added to authorized origins in Google Cloud Console
- Try clearing cached auth tokens and re-authenticating

### API Errors
- Check that Gmail API is enabled in your Google Cloud project
- Verify you have the correct scopes configured
- Ensure you're not hitting API rate limits

### Extension Not Loading
- Check Chrome's developer console for errors
- Verify all files are present and properly formatted
- Make sure manifest.json is valid

## License

MIT License - see LICENSE file for details.
