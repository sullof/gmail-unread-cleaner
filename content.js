// Content script for Gmail integration
// This script runs in the Gmail page context

class GmailContentScript {
    constructor() {
        this.init();
    }

    init() {
        // Listen for messages from popup/background
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true;
        });

        // Inject UI elements if needed
        this.injectStyles();
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getGmailData':
                sendResponse(this.getGmailData());
                break;
            case 'highlightMessages':
                this.highlightMessages(request.messageIds);
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ error: 'Unknown action' });
        }
    }

    getGmailData() {
        // Extract current folder/label information from Gmail UI
        const currentLabel = this.getCurrentLabel();
        return {
            currentLabel: currentLabel,
            isGmailPage: true
        };
    }

    getCurrentLabel() {
        // Try to determine the current label/folder from Gmail's UI
        const labelElements = document.querySelectorAll('[data-label-id]');
        const activeLabel = Array.from(labelElements).find(el => 
            el.classList.contains('active') || el.getAttribute('aria-selected') === 'true'
        );
        
        if (activeLabel) {
            return {
                id: activeLabel.getAttribute('data-label-id'),
                name: activeLabel.textContent.trim()
            };
        }

        // Fallback: check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const labelParam = urlParams.get('label');
        if (labelParam) {
            return {
                id: labelParam,
                name: this.decodeLabelName(labelParam)
            };
        }

        return null;
    }

    decodeLabelName(labelId) {
        // Convert label ID to readable name
        const labelMap = {
            'INBOX': 'Inbox',
            'STARRED': 'Starred',
            'IMPORTANT': 'Important',
            'SENT': 'Sent',
            'DRAFTS': 'Drafts',
            'SPAM': 'Spam',
            'TRASH': 'Trash'
        };

        return labelMap[labelId] || labelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    highlightMessages(messageIds) {
        // Highlight messages in Gmail interface (for preview mode)
        messageIds.forEach(id => {
            const messageElement = document.querySelector(`[data-message-id="${id}"]`);
            if (messageElement) {
                messageElement.style.backgroundColor = '#fff3cd';
                messageElement.style.border = '2px solid #ffc107';
            }
        });
    }

    injectStyles() {
        // Inject custom styles for highlighting
        const style = document.createElement('style');
        style.textContent = `
            .gmail-cleaner-highlight {
                background-color: #fff3cd !important;
                border: 2px solid #ffc107 !important;
                transition: all 0.3s ease;
            }
            
            .gmail-cleaner-highlight:hover {
                background-color: #ffeaa7 !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize content script
new GmailContentScript();
