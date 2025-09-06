class GmailCleanerPopup {
    constructor() {
        this.isAuthenticated = false;
        this.folders = [];
        this.messages = [];
        
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.setupEventListeners();
        
        // Set default date to 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        document.getElementById('dateInput').value = thirtyDaysAgo.toISOString().split('T')[0];
    }

    async checkAuthentication() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });
            this.isAuthenticated = response.authenticated;
            
            if (this.isAuthenticated) {
                this.showMainSection();
                await this.loadFolders();
            } else {
                this.showAuthSection();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showAuthSection();
        }
    }

    setupEventListeners() {
        document.getElementById('loginBtn').addEventListener('click', () => this.authenticate());
        document.getElementById('scanBtn').addEventListener('click', () => this.scanMessages());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteMessages());
    }

    async authenticate() {
        try {
            this.setStatus('Connecting to Gmail...', 'loading');
            await chrome.runtime.sendMessage({ action: 'authenticate' });
            await this.checkAuthentication();
        } catch (error) {
            console.error('Authentication failed:', error);
            this.setStatus('Authentication failed. Please try again.', 'error');
        }
    }

    async loadFolders() {
        try {
            this.setStatus('Loading folders...', 'loading');
            const response = await chrome.runtime.sendMessage({ action: 'getFolders' });
            this.folders = response.folders || [];
            this.populateFolderSelect();
            this.setStatus('Folders loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load folders:', error);
            this.setStatus('Failed to load folders', 'error');
        }
    }

    populateFolderSelect() {
        const select = document.getElementById('folderSelect');
        select.innerHTML = '<option value="">Select a folder...</option>';
        
        this.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            select.appendChild(option);
        });
    }

    async scanMessages() {
        const folderId = document.getElementById('folderSelect').value;
        const dateInput = document.getElementById('dateInput').value;
        const previewMode = document.getElementById('previewMode').checked;

        if (!folderId) {
            this.setStatus('Please select a folder', 'error');
            return;
        }

        if (!dateInput) {
            this.setStatus('Please select a date', 'error');
            return;
        }

        try {
            this.setStatus('Scanning messages...', 'loading');
            
            const response = await chrome.runtime.sendMessage({
                action: 'scanMessages',
                folderId: folderId,
                date: dateInput,
                previewMode: previewMode
            });

            this.messages = response.messages || [];
            this.displayResults();
            
            if (previewMode) {
                this.setStatus(`Found ${this.messages.length} messages to delete (preview mode)`, 'success');
            } else {
                this.setStatus(`Found ${this.messages.length} messages to delete`, 'success');
                if (this.messages.length > 0) {
                    document.getElementById('deleteBtn').style.display = 'inline-block';
                }
            }
        } catch (error) {
            console.error('Scan failed:', error);
            this.setStatus('Failed to scan messages', 'error');
        }
    }

    async deleteMessages() {
        if (this.messages.length === 0) {
            this.setStatus('No messages to delete', 'error');
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete ${this.messages.length} messages? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            this.setStatus('Deleting messages...', 'loading');
            
            const response = await chrome.runtime.sendMessage({
                action: 'deleteMessages',
                messageIds: this.messages.map(msg => msg.id)
            });

            if (response.success) {
                this.setStatus(`Successfully deleted ${response.deletedCount} messages`, 'success');
                this.messages = [];
                document.getElementById('deleteBtn').style.display = 'none';
                document.getElementById('results').style.display = 'none';
            } else {
                this.setStatus(`Failed to delete messages: ${response.error}`, 'error');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            this.setStatus('Failed to delete messages', 'error');
        }
    }

    displayResults() {
        const resultsDiv = document.getElementById('results');
        const countDiv = document.getElementById('messageCount');
        const listDiv = document.getElementById('messageList');

        resultsDiv.style.display = 'block';
        countDiv.textContent = `Found ${this.messages.length} unread messages older than the selected date`;

        listDiv.innerHTML = '';
        this.messages.slice(0, 20).forEach(msg => {
            const item = document.createElement('div');
            item.className = 'message-item';
            
            const subject = document.createElement('div');
            subject.className = 'message-subject';
            subject.textContent = msg.subject || '(No subject)';
            
            const date = document.createElement('div');
            date.className = 'message-date';
            date.textContent = new Date(msg.date).toLocaleDateString();
            
            item.appendChild(subject);
            item.appendChild(date);
            listDiv.appendChild(item);
        });

        if (this.messages.length > 20) {
            const more = document.createElement('div');
            more.className = 'message-item';
            more.textContent = `... and ${this.messages.length - 20} more messages`;
            listDiv.appendChild(more);
        }
    }

    setStatus(message, type) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'status';
            }, 5000);
        }
    }

    showAuthSection() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainSection').style.display = 'none';
    }

    showMainSection() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GmailCleanerPopup();
});
