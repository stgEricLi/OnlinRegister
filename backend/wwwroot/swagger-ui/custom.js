// Custom JavaScript for enhanced JWT token management in Swagger UI

(function() {
    'use strict';

    // Wait for Swagger UI to load
    function waitForSwaggerUI() {
        if (typeof window.ui !== 'undefined') {
            initializeTokenManagement();
        } else {
            setTimeout(waitForSwaggerUI, 100);
        }
    }

    function initializeTokenManagement() {
        console.log('Initializing JWT token management...');

        // Store token in localStorage when user logs in successfully
        interceptLoginResponse();
        
        // Auto-fill token if available in localStorage
        autoFillTokenFromStorage();
        
        // Add helpful instructions
        addTokenInstructions();
    }

    function interceptLoginResponse() {
        // Override the original fetch to intercept login responses
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                // Check if this is a login request
                if (args[0].includes('/api/auth/login') && response.ok) {
                    response.clone().json().then(data => {
                        if (data.token) {
                            // Store the token
                            localStorage.setItem('jwt_token', data.token);
                            
                            // Show success notification
                            showTokenNotification('Login successful! Token saved. Click "Authorize" to use it.');
                            
                            // Highlight the authorize button
                            highlightAuthorizeButton();
                        }
                    }).catch(err => console.log('Error parsing login response:', err));
                }
                return response;
            });
        };
    }

    function autoFillTokenFromStorage() {
        const savedToken = localStorage.getItem('jwt_token');
        if (savedToken) {
            // Wait for the authorize modal to be available
            setTimeout(() => {
                const authorizeBtn = document.querySelector('.btn.authorize');
                if (authorizeBtn) {
                    authorizeBtn.addEventListener('click', () => {
                        setTimeout(() => {
                            const tokenInput = document.querySelector('input[placeholder*="Bearer"]');
                            if (tokenInput && !tokenInput.value) {
                                tokenInput.value = `Bearer ${savedToken}`;
                                showTokenNotification('Token auto-filled from previous login!');
                            }
                        }, 500);
                    });
                }
            }, 1000);
        }
    }

    function highlightAuthorizeButton() {
        setTimeout(() => {
            const authorizeBtn = document.querySelector('.btn.authorize');
            if (authorizeBtn) {
                authorizeBtn.style.animation = 'pulse 1s infinite';
                authorizeBtn.title = 'Click here to add your JWT token for authentication';
            }
        }, 1000);
    }

    function showTokenNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.token-success-notification');
        if (existing) {
            existing.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'token-success-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    function addTokenInstructions() {
        setTimeout(() => {
            // Add instructions near the authorize button
            const topbar = document.querySelector('.topbar');
            if (topbar && !document.querySelector('.token-instructions')) {
                const instructions = document.createElement('div');
                instructions.className = 'token-instructions';
                instructions.innerHTML = `
                    <div style="background: #e3f2fd; padding: 10px; margin: 10px; border-radius: 5px; border-left: 4px solid #2196f3;">
                        <strong>🔐 JWT Authentication:</strong>
                        <ol style="margin: 5px 0; padding-left: 20px;">
                            <li>First, use <strong>POST /api/auth/login</strong> to get your JWT token</li>
                            <li>Copy the token from the response</li>
                            <li>Click the <strong>"Authorize"</strong> button above</li>
                            <li>Enter: <code>Bearer YOUR_TOKEN_HERE</code></li>
                            <li>Click "Authorize" and "Close"</li>
                            <li>Now you can access protected endpoints! 🚀</li>
                        </ol>
                    </div>
                `;
                topbar.appendChild(instructions);
            }
        }, 2000);
    }

    // Clear token on logout (if you have a logout endpoint)
    function clearTokenOnLogout() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                if (args[0].includes('/api/auth/logout') && response.ok) {
                    localStorage.removeItem('jwt_token');
                    showTokenNotification('Logged out successfully. Token cleared.');
                }
                return response;
            });
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForSwaggerUI);
    } else {
        waitForSwaggerUI();
    }

})();