class GmailCleanerBackground {
    constructor() {
        this.accessToken = null;
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'checkAuth':
                    sendResponse({ authenticated: await this.checkAuthentication() });
                    break;
                
                case 'authenticate':
                    await this.authenticate();
                    sendResponse({ success: true });
                    break;
                
                case 'getFolders':
                    const folders = await this.getFolders();
                    sendResponse({ folders });
                    break;
                
                case 'scanMessages':
                    const messages = await this.scanMessages(request.folderId, request.date, request.previewMode);
                    sendResponse({ messages });
                    break;
                
                case 'deleteMessages':
                    const result = await this.deleteMessages(request.messageIds);
                    sendResponse(result);
                    break;
                
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ error: error.message });
        }
    }

    async checkAuthentication() {
        try {
            const token = await this.getAccessToken();
            return !!token;
        } catch (error) {
            return false;
        }
    }

    async authenticate() {
        try {
            const token = await chrome.identity.getAuthToken({
                interactive: true,
                scopes: [
                    'https://www.googleapis.com/auth/gmail.readonly',
                    'https://www.googleapis.com/auth/gmail.modify'
                ]
            });
            this.accessToken = token;
            return token;
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }

    async getAccessToken() {
        if (this.accessToken) {
            return this.accessToken;
        }

        try {
            const token = await chrome.identity.getAuthToken({
                interactive: false
            });
            this.accessToken = token;
            return token;
        } catch (error) {
            return null;
        }
    }

    async makeGmailRequest(endpoint, options = {}) {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const url = `https://gmail.googleapis.com/gmail/v1${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, clear it and re-authenticate
                this.accessToken = null;
                await chrome.identity.clearAllCachedAuthTokens();
                throw new Error('Authentication expired. Please re-authenticate.');
            }
            throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getFolders() {
        try {
            const response = await this.makeGmailRequest('/users/me/labels');
            const folders = response.labels
                .filter(label => label.type === 'user') // Only user-created labels
                .map(label => ({
                    id: label.id,
                    name: label.name
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            // Add Inbox as a special case
            const inboxLabel = response.labels.find(label => label.id === 'INBOX');
            if (inboxLabel) {
                folders.unshift({
                    id: 'INBOX',
                    name: 'Inbox'
                });
            }

            return folders;
        } catch (error) {
            console.error('Failed to get folders:', error);
            throw error;
        }
    }

    async scanMessages(folderId, dateString, previewMode = true) {
        try {
            const cutoffDate = new Date(dateString);
            const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);

            // Build search query
            let query = `label:${folderId} is:unread`;
            
            // Add date filter (messages older than cutoff date)
            query += ` before:${Math.floor(cutoffDate.getTime() / 1000)}`;

            const response = await this.makeGmailRequest(`/users/me/messages?q=${encodeURIComponent(query)}&maxResults=500`);
            
            if (!response.messages || response.messages.length === 0) {
                return [];
            }

            // Get detailed message information
            const messagePromises = response.messages.map(msg => this.getMessageDetails(msg.id));
            const messages = await Promise.all(messagePromises);

            // Filter and format messages
            const filteredMessages = messages
                .filter(msg => {
                    const messageDate = new Date(parseInt(msg.internalDate));
                    return messageDate < cutoffDate;
                })
                .map(msg => ({
                    id: msg.id,
                    subject: this.extractSubject(msg.payload),
                    date: new Date(parseInt(msg.internalDate)),
                    snippet: msg.snippet
                }))
                .sort((a, b) => a.date - b.date);

            return filteredMessages;
        } catch (error) {
            console.error('Failed to scan messages:', error);
            throw error;
        }
    }

    async getMessageDetails(messageId) {
        try {
            const response = await this.makeGmailRequest(`/users/me/messages/${messageId}`);
            return response;
        } catch (error) {
            console.error(`Failed to get message ${messageId}:`, error);
            throw error;
        }
    }

    extractSubject(payload) {
        if (!payload || !payload.headers) {
            return '(No subject)';
        }

        const subjectHeader = payload.headers.find(header => header.name.toLowerCase() === 'subject');
        return subjectHeader ? subjectHeader.value : '(No subject)';
    }

    async deleteMessages(messageIds) {
        try {
            if (!messageIds || messageIds.length === 0) {
                return { success: true, deletedCount: 0 };
            }

            // Gmail API allows batch deletion
            const response = await this.makeGmailRequest('/users/me/messages/batchDelete', {
                method: 'POST',
                body: JSON.stringify({
                    ids: messageIds
                })
            });

            return {
                success: true,
                deletedCount: messageIds.length
            };
        } catch (error) {
            console.error('Failed to delete messages:', error);
            return {
                success: false,
                error: error.message,
                deletedCount: 0
            };
        }
    }
}

// Initialize background script
new GmailCleanerBackground();
