// Simple test script to verify extension structure
// Run with: node test-extension.js

const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.css',
    'popup.js',
    'background.js',
    'content.js',
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png'
];

const requiredDirs = [
    'icons'
];

console.log('🔍 Testing Gmail Unread Cleaner Extension Structure...\n');

// Check directories
console.log('📁 Checking directories:');
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/`);
    } else {
        console.log(`❌ Missing directory: ${dir}/`);
    }
});

console.log('\n📄 Checking files:');
let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
        
        // Check file size (should not be empty)
        const stats = fs.statSync(file);
        if (stats.size === 0) {
            console.log(`⚠️  Warning: ${file} is empty`);
        }
    } else {
        console.log(`❌ Missing file: ${file}`);
        allFilesExist = false;
    }
});

// Validate manifest.json
console.log('\n📋 Validating manifest.json:');
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    const requiredManifestFields = ['manifest_version', 'name', 'version', 'permissions', 'action'];
    requiredManifestFields.forEach(field => {
        if (manifest[field]) {
            console.log(`✅ ${field}: ${typeof manifest[field] === 'object' ? 'object' : manifest[field]}`);
        } else {
            console.log(`❌ Missing manifest field: ${field}`);
        }
    });
    
    // Check for placeholder client ID
    if (manifest.oauth2 && manifest.oauth2.client_id.includes('YOUR_CLIENT_ID')) {
        console.log('⚠️  Warning: OAuth2 client_id still contains placeholder. Update with your Google Cloud Console client ID.');
    }
    
} catch (error) {
    console.log(`❌ Invalid manifest.json: ${error.message}`);
}

// Check HTML structure
console.log('\n🌐 Validating HTML structure:');
try {
    const html = fs.readFileSync('popup.html', 'utf8');
    
    if (html.includes('<title>')) {
        console.log('✅ HTML has title tag');
    } else {
        console.log('❌ HTML missing title tag');
    }
    
    if (html.includes('popup.js')) {
        console.log('✅ HTML references popup.js');
    } else {
        console.log('❌ HTML missing popup.js reference');
    }
    
    if (html.includes('popup.css')) {
        console.log('✅ HTML references popup.css');
    } else {
        console.log('❌ HTML missing popup.css reference');
    }
    
} catch (error) {
    console.log(`❌ Error reading popup.html: ${error.message}`);
}

console.log('\n📊 Summary:');
if (allFilesExist) {
    console.log('✅ All required files present');
    console.log('✅ Extension structure looks good!');
    console.log('\n🚀 Next steps:');
    console.log('1. Set up Google Cloud Console OAuth2 credentials');
    console.log('2. Update manifest.json with your client ID');
    console.log('3. Load extension in Chrome (chrome://extensions/)');
    console.log('4. Test the extension functionality');
} else {
    console.log('❌ Some files are missing. Please check the errors above.');
}

console.log('\n📖 For detailed setup instructions, see: install.md');
