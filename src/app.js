// React components for enhanced interactivity
// This can be loaded alongside the vanilla JavaScript for progressive enhancement

// Cart Management Component
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.bindEvents();
    }

    bindEvents() {
        // Listen for cart updates
        document.addEventListener('cartUpdated', () => {
            this.updateCartDisplay();
        });

        // Listen for page load
        document.addEventListener('DOMContentLoaded', () => {
            this.updateCartCount();
        });
    }

    addItem(productId, quantity = 1) {
        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.dispatchCartEvent();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.dispatchCartEvent();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartDisplay();
                this.dispatchCartEvent();
            }
        }
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartDisplay() {
        this.updateCartCount();
        this.updateCartModal();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    }

    dispatchCartEvent() {
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { items: this.items, total: this.getTotalItems() }
        }));
    }

    updateCartModal() {
        // Update cart modal if it exists
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.classList.contains('show')) {
            this.renderCartModal();
        }
    }

    async renderCartModal() {
        const cartModal = document.getElementById('cart-modal');
        if (!cartModal) return;

        if (this.items.length === 0) {
            cartModal.innerHTML = `
                <div class="cart-modal-content">
                    <div class="cart-header">
                        <h3>Your Cart</h3>
                        <button class="close-cart" onclick="closeCartModal()">&times;</button>
                    </div>
                    <div class="empty-cart">
                        <p>Your cart is empty</p>
                        <button class="btn btn-primary" onclick="closeCartModal()">Continue Shopping</button>
                    </div>
                </div>
            `;
            return;
        }

        try {
            // Fetch product details for cart items
            let products = [];
            
            // First, try to load from localStorage (admin updates)
            const localProducts = localStorage.getItem('products');
            if (localProducts) {
                products = JSON.parse(localProducts);
            } else {
                // Fallback to JSON file for initial data
                const response = await fetch('data/products.json');
                products = await response.json();
            }
                let cartHTML = `
                    <div class="cart-modal-content">
                        <div class="cart-header">
                            <h3>Your Cart (${this.getTotalItems()} items)</h3>
                            <button class="close-cart" onclick="closeCartModal()">&times;</button>
                        </div>
                        <div class="cart-items">
                `;

                let total = 0;

                this.items.forEach(cartItem => {
                    const product = products.find(p => p.id === cartItem.productId);
                    if (product) {
                        const itemTotal = product.price * cartItem.quantity;
                        total += itemTotal;

                                                 cartHTML += `
                             <div class="cart-item">
                                 <div class="cart-item-image"><img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.svg'"></div>
                                <div class="cart-item-details">
                                    <h4>${product.name}</h4>
                                    <p class="cart-item-price">R${product.price.toFixed(2)} each</p>
                                </div>
                                <div class="cart-item-quantity">
                                    <button onclick="cart.updateQuantity(${product.id}, ${cartItem.quantity - 1})">-</button>
                                    <span>${cartItem.quantity}</span>
                                    <button onclick="cart.updateQuantity(${product.id}, ${cartItem.quantity + 1})">+</button>
                                </div>
                                <div class="cart-item-total">R${itemTotal.toFixed(2)}</div>
                                <button class="remove-item" onclick="cart.removeItem(${product.id})">×</button>
                            </div>
                        `;
                    }
                });

                cartHTML += `
                        </div>
                        <div class="cart-footer">
                            <div class="cart-total">
                                <strong>Total: R${total.toFixed(2)}</strong>
                            </div>
                            <div class="cart-actions">
                                <button class="btn btn-secondary" onclick="closeCartModal()">Continue Shopping</button>
                                <button class="btn btn-primary" onclick="proceedToCheckout()">Checkout</button>
                            </div>
                        </div>
                    </div>
                `;

                cartModal.innerHTML = cartHTML;
        } catch (error) {
            console.error('Error loading cart details:', error);
        }
    }
}

// Wishlist Component
class Wishlist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.init();
    }

    init() {
        this.updateWishlistDisplay();
    }

    addItem(productId) {
        if (!this.items.includes(productId)) {
            this.items.push(productId);
            this.saveWishlist();
            this.updateWishlistDisplay();
            showNotification('Added to wishlist!', 'success');
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(id => id !== productId);
        this.saveWishlist();
        this.updateWishlistDisplay();
        showNotification('Removed from wishlist', 'info');
    }

    toggleItem(productId) {
        if (this.items.includes(productId)) {
            this.removeItem(productId);
        } else {
            this.addItem(productId);
        }
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

    updateWishlistDisplay() {
        // Update wishlist hearts on product cards
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productId = parseInt(card.dataset.productId);
            const heartButton = card.querySelector('.wishlist-heart');
            
            if (heartButton) {
                if (this.items.includes(productId)) {
                    heartButton.classList.add('active');
                    heartButton.innerHTML = '❤️';
                } else {
                    heartButton.classList.remove('active');
                    heartButton.innerHTML = '🤍';
                }
            }
        });
    }
}

// Product Search Component
class ProductSearch {
    constructor() {
        this.allProducts = [];
        this.init();
    }

    async init() {
        await this.loadAllProducts();
        this.setupSearchFunctionality();
    }

    async loadAllProducts() {
        try {
            // First, try to load from localStorage (admin updates)
            const localProducts = localStorage.getItem('products');
            if (localProducts) {
                this.allProducts = JSON.parse(localProducts);
            } else {
                // Fallback to JSON file for initial data
                const response = await fetch('data/products.json');
                this.allProducts = await response.json();
            }
        } catch (error) {
            console.error('Error loading products for search:', error);
        }
    }

    setupSearchFunctionality() {
        // Create search input if it doesn't exist
        let searchInput = document.getElementById('product-search');
        
        if (!searchInput) {
            const productFilters = document.querySelector('.product-filters');
            if (productFilters) {
                searchInput = document.createElement('input');
                searchInput.id = 'product-search';
                searchInput.type = 'text';
                searchInput.placeholder = 'Search products...';
                searchInput.className = 'product-search-input';
                
                productFilters.parentNode.insertBefore(searchInput, productFilters);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    }

    performSearch(query) {
        if (!query.trim()) {
            // If search is empty, show all products
            displayProducts(this.allProducts);
            return;
        }

        const filteredProducts = this.allProducts.filter(product => {
            const searchTerm = query.toLowerCase();
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes(searchTerm)
                )
            );
        });

        displayProducts(filteredProducts);
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    window.cart = new ShoppingCart();
    
    // Initialize wishlist
    window.wishlist = new Wishlist();
    
    // Initialize search
    window.productSearch = new ProductSearch();
    
    // Setup cart modal
    setupCartModal();
    
    // Setup enhanced product interactions
    setupEnhancedProductInteractions();
});

// Setup cart modal
function setupCartModal() {
    // Create cart modal if it doesn't exist
    let cartModal = document.getElementById('cart-modal');
    
    if (!cartModal) {
        cartModal = document.createElement('div');
        cartModal.id = 'cart-modal';
        cartModal.className = 'cart-modal';
        cartModal.innerHTML = '<div class="cart-modal-backdrop" onclick="closeCartModal()"></div>';
        document.body.appendChild(cartModal);
    }

    // Add cart modal styles
    const cartStyles = `
        <style>
        .cart-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
        }
        
        .cart-modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .cart-modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }
        
        .cart-modal-content {
            background: white;
            border-radius: 15px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 2001;
            position: relative;
            margin: 20px;
            width: 100%;
        }
        
        .cart-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .close-cart {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #666;
        }
        
        .cart-item {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            gap: 15px;
        }
        
        .cart-item-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
        }
        
        .cart-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .cart-item-details {
            flex: 1;
        }
        
        .cart-item-quantity {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .cart-item-quantity button {
            width: 30px;
            height: 30px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 50%;
            cursor: pointer;
        }
        
        .cart-footer {
            padding: 20px;
        }
        
        .cart-total {
            font-size: 1.2rem;
            margin-bottom: 15px;
        }
        
        .cart-actions {
            display: flex;
            gap: 10px;
        }
        
        .cart-actions button {
            flex: 1;
        }
        
        .empty-cart {
            padding: 40px 20px;
            text-align: center;
        }
        
        .product-search-input {
            width: 100%;
            max-width: 400px;
            padding: 10px 15px;
            border: 2px solid var(--accent-color);
            border-radius: 25px;
            font-size: 1rem;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .product-search-input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        </style>
    `;
    
    if (!document.getElementById('cart-modal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'cart-modal-styles';
        styleElement.innerHTML = cartStyles;
        document.head.appendChild(styleElement);
    }

    // Add click handler to cart icon
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }
}

// Setup enhanced product interactions
function setupEnhancedProductInteractions() {
    // This will be called after products are loaded
    document.addEventListener('productsLoaded', function() {
        addWishlistButtons();
        addQuickViewButtons();
    });
}

// Add wishlist buttons to product cards
function addWishlistButtons() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (!card.querySelector('.wishlist-heart')) {
            const productInfo = card.querySelector('.product-info');
            const productId = parseInt(card.dataset.productId);
            
            const wishlistButton = document.createElement('button');
            wishlistButton.className = 'wishlist-heart';
            wishlistButton.innerHTML = '🤍';
            wishlistButton.onclick = () => wishlist.toggleItem(productId);
            
            productInfo.insertBefore(wishlistButton, productInfo.firstChild);
        }
    });
    
    // Update wishlist display
    if (window.wishlist) {
        window.wishlist.updateWishlistDisplay();
    }
}

// Cart modal functions
function openCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.add('show');
        window.cart.renderCartModal();
        document.body.style.overflow = 'hidden';
    }
}

function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function proceedToCheckout() {
    showNotification('Checkout functionality would be implemented here!', 'info');
    closeCartModal();
}

// Override the original addToCart function to use the cart class
window.addToCart = function(productId) {
    window.cart.addItem(productId, 1);
};

// Add CSS for enhanced interactions
const enhancedStyles = `
<style>
.wishlist-heart {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

.wishlist-heart:hover {
    transform: scale(1.1);
    background: white;
}

.wishlist-heart.active {
    background: rgba(255, 192, 203, 0.9);
}

.product-card {
    position: relative;
}

.loading-products, .error-message, .no-products {
    text-align: center;
    padding: 40px;
    color: var(--text-light);
    font-size: 1.1rem;
}

.error-message {
    color: #dc3545;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', enhancedStyles); 