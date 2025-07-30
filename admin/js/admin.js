// Admin Panel JavaScript - Golden Crumb Biscuit Company
// Pure JavaScript replacement for PHP backend

// Admin Authentication System
class AdminAuth {
    static ADMIN_USERNAME = 'admin';
    static ADMIN_PASSWORD = 'goldencrumb2024'; // Change this in production!
    
    static login(username, password) {
        return new Promise((resolve) => {
            // Simulate server delay
            setTimeout(() => {
                if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
                    const session = {
                        username: username,
                        loginTime: new Date().toISOString(),
                        sessionId: this.generateSessionId()
                    };
                    
                    localStorage.setItem('adminSession', JSON.stringify(session));
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 1000);
        });
    }
    
    static logout() {
        localStorage.removeItem('adminSession');
        window.location.href = 'index.html?logged_out=1';
    }
    
    static isLoggedIn() {
        const session = localStorage.getItem('adminSession');
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            // Check if session is less than 24 hours old
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            return hoursDiff < 24;
        } catch (error) {
            return false;
        }
    }
    
    static getSession() {
        const session = localStorage.getItem('adminSession');
        return session ? JSON.parse(session) : null;
    }
    
    static generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    
    static requireAuth() {
        if (!this.isLoggedIn()) {
            // Prevent redirect loops by checking current page
            if (!window.location.href.includes('index.html')) {
                console.log('Redirecting to login...');
                window.location.href = 'index.html';
            }
            return false;
        }
        return true;
    }
}

// Product Management System
class ProductManager {
    static async loadProducts() {
        try {
            // First, try to load from localStorage (admin updates)
            const localProducts = localStorage.getItem('products');
            if (localProducts) {
                return JSON.parse(localProducts);
            }
            
            // If no localStorage data, load from JSON file and store in localStorage
            const response = await fetch('../data/products.json');
            const products = await response.json();
            
            // Store initial data in localStorage for future admin operations
            localStorage.setItem('products', JSON.stringify(products));
            console.log('Initialized localStorage with products from JSON file');
            
            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }
    
    static async saveProducts(products) {
        try {
            // Save to localStorage (primary storage for client-side app)
            localStorage.setItem('products', JSON.stringify(products));
            console.log('Products saved to localStorage successfully');
            
            // Dispatch a custom event to notify other parts of the application
            window.dispatchEvent(new CustomEvent('productsUpdated', { 
                detail: { products } 
            }));
            
            return true;
        } catch (error) {
            console.error('Error saving products:', error);
            throw new Error('Failed to save products');
        }
    }
    
    static async addProduct(productData) {
        const products = await this.loadProducts();
        
        // Generate new ID
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        const newProduct = {
            id: maxId + 1,
            ...productData
        };
        
        products.push(newProduct);
        await this.saveProducts(products);
        
        return newProduct;
    }
    
    static async updateProduct(id, productData) {
        const products = await this.loadProducts();
        const index = products.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Product not found');
        }
        
        products[index] = { ...products[index], ...productData };
        await this.saveProducts(products);
        
        return products[index];
    }
    
    static async deleteProduct(id) {
        const products = await this.loadProducts();
        const filteredProducts = products.filter(p => p.id !== id);
        await this.saveProducts(filteredProducts);
        
        return true;
    }
    
    static getStats(products) {
        return {
            total: products.length,
            inStock: products.filter(p => p.in_stock).length,
            featured: products.filter(p => p.featured).length,
            byCategory: {
                sweet: products.filter(p => p.category === 'sweet').length,
                savory: products.filter(p => p.category === 'savory').length,
                specialty: products.filter(p => p.category === 'specialty').length
            }
        };
    }
}

// Contact Message Manager
class ContactManager {
    static getMessages() {
        return JSON.parse(localStorage.getItem('contactMessages')) || [];
    }
    
    static getStats() {
        const messages = this.getMessages();
        return {
            total: messages.length,
            today: messages.filter(m => {
                const messageDate = new Date(m.timestamp);
                const today = new Date();
                return messageDate.toDateString() === today.toDateString();
            }).length,
            thisWeek: messages.filter(m => {
                const messageDate = new Date(m.timestamp);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return messageDate >= weekAgo;
            }).length
        };
    }
}

// Order Manager
class OrderManager {
    static getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }
    
    static getStats() {
        const orders = this.getOrders();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        return {
            total: orders.length,
            revenue: totalRevenue,
            pending: orders.filter(o => o.status === 'pending').length,
            completed: orders.filter(o => o.status === 'completed').length
        };
    }
}

// Utility Functions
class AdminUtils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount);
    }
    
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    static showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.admin-notification');
        existing.forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="close-notification">&times;</button>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '9999',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.3s ease'
        });
        
        // Set background color
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    static validateProduct(productData) {
        const errors = [];
        
        if (!productData.name || productData.name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters');
        }
        
        if (!productData.description || productData.description.trim().length < 10) {
            errors.push('Description must be at least 10 characters');
        }
        
        if (!productData.price || productData.price <= 0) {
            errors.push('Price must be greater than 0');
        }
        
        if (!productData.category) {
            errors.push('Category is required');
        }
        
        if (!productData.image) {
            errors.push('Image is required');
        }
        
        if (!productData.ingredients || productData.ingredients.length === 0) {
            errors.push('At least one ingredient is required');
        }
        
        return errors;
    }
}

// Add notification styles to document
const notificationStyles = `
<style>
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.admin-notification {
    font-family: 'Open Sans', sans-serif;
}

.close-notification {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
}

.close-notification:hover {
    opacity: 0.8;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Export for global use
window.AdminAuth = AdminAuth;
window.ProductManager = ProductManager;
window.ContactManager = ContactManager;
window.OrderManager = OrderManager;
window.AdminUtils = AdminUtils; 