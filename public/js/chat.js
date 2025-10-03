class ChatWidget {
    constructor() {
        this.sessionId = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createChatWidget();
        this.bindEvents();
        this.startChatSession();
    }

    createChatWidget() {
        // Widget is already in HTML, just bind events
        this.chatButton = document.querySelector('.chat-button');
        this.chatBox = document.querySelector('.chat-box');
        this.closeChat = document.querySelector('.close-chat');
        this.chatMessages = document.querySelector('.chat-messages');
        this.chatInput = document.querySelector('.chat-input input');
        this.sendButton = document.querySelector('.chat-input button');
    }

    bindEvents() {
        this.chatButton.addEventListener('click', () => this.toggleChat());
        this.closeChat.addEventListener('click', () => this.closeChatBox());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async startChatSession() {
        try {
            const response = await fetch('/chat/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            this.sessionId = data.sessionId;
            this.addMessage('bot', data.message);
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatBox.classList.toggle('active', this.isOpen);
        
        if (this.isOpen) {
            this.chatInput.focus();
        }
    }

    closeChatBox() {
        this.isOpen = false;
        this.chatBox.classList.remove('active');
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.chatInput.value = '';

        try {
            const response = await fetch('/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    message: message
                })
            });
            const data = await response.json();
            this.addMessage('bot', data.message);
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
        }
    }

    addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});