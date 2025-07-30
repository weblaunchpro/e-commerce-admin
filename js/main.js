// Main JavaScript file for Golden Crumb Biscuit Company website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    setupNavigation();
    setupScrollProgress();
    setupContactForm();
    setupSmoothScrolling();
    setupAnimations();
    setupProductFilters();
    loadProducts();
}

// Navigation functionality
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Update active nav link based on scroll position
    window.addEventListener('scroll', updateActiveNavLink);
}

// Update active navigation link based on current section
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Setup scroll progress bar
function setupScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Handle contact form submission
async function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    // Get form data
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    // Validate form
    const errors = validateContactForm(data);
    if (errors.length > 0) {
        showNotification('Please fix the following errors:\n' + errors.join('\n'), 'error');
        return;
    }
    
    // Show loading state
    submitButton.innerHTML = '<span class="loading"></span> Sending...';
    submitButton.disabled = true;
    
    try {
        // Save to localStorage (in real app, send to server)
        let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        messages.push(data);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Simulate sending delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Sorry, there was an error sending your message. Please try again later.', 'error');
    } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Validate contact form data
function validateContactForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Setup smooth scrolling for anchor links
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Setup scroll animations
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.section-title, .product-card, .feature, .contact-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Setup product filters
function setupProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Load filtered products
            loadProducts(filter);
        });
    });
}

// Load and display products
async function loadProducts(category = 'all') {
    console.log('loadProducts called with category:', category);
    
    const productGrid = document.getElementById('product-grid');
    
    if (!productGrid) {
        console.log('Product grid not found');
        return;
    }
    
    // Show loading state
    productGrid.innerHTML = '<div class="loading-products">Loading delicious biscuits...</div>';
    
    try {
        let products = [];
        
        // First, try to load from localStorage (admin updates)
        const localProducts = localStorage.getItem('products');
        if (localProducts) {
            products = JSON.parse(localProducts);
            console.log('Loaded products from localStorage (admin updates)');
        } else {
            // Fallback to JSON file for initial data
            const response = await fetch('data/products.json');
            products = await response.json();
            console.log('Loaded products from JSON file (initial data)');
        }
        
        // Filter products by category
        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(product => product.category === category);
        
        displayProducts(filteredProducts);
        
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<div class="error-message">Sorry, unable to load products at this time.</div>';
    }
}

// Display products in the grid
function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    
    if (products.length === 0) {
        productGrid.innerHTML = '<div class="no-products">No products found in this category.</div>';
        return;
    }
    
    const productsHTML = products.map(product => `
        <div class="product-card ${product.in_stock ? '' : 'out-of-stock'}" data-category="${product.category}" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='images/placeholder.svg'"
                     style="opacity: 0; transition: opacity 0.3s ease;"
                     onload="this.style.opacity = '1';">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">R${product.price.toFixed(2)}</div>
                ${product.in_stock 
                    ? `<button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>`
                    : `<button class="add-to-cart" disabled>Out of Stock</button>`
                }
            </div>
        </div>
    `).join('');
    
    productGrid.innerHTML = productsHTML;
    
    // Animate product cards
    const productCards = productGrid.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}

// Add product to cart
async function addToCart(productId) {
    try {
        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount();
        showNotification('Product added to cart!', 'success');
        
        console.log('Product added to cart. Cart now contains:', cart.length, 'items');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add product to cart', 'error');
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        // Get actual cart data and calculate total items
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCount.textContent = totalItems;
        
        // Add animation only if count changed
        if (totalItems > 0) {
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 200);
        }
    }
}

// Show notification to user
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Utility function to debounce scroll events

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add debounced scroll listener for performance
window.addEventListener('scroll', debounce(updateActiveNavLink, 100));

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main website initialized');
    
    // Initialize cart count on page load
    updateCartCount();
    
    // Listen for product updates from admin panel (but debounce it)
    let updateTimeout;
    window.addEventListener('productsUpdated', function(e) {
        console.log('Products updated event received');
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            console.log('Refreshing products after admin update...');
            loadProducts(); // Refresh the current category
        }, 500); // Debounce to prevent rapid refreshes
    });
    
    // Add refresh button after initial load (only once)
    setTimeout(() => {
        console.log('Adding refresh button');
        addRefreshButton();
    }, 2000);
});

// Add a refresh button for manual updates (only once)
function addRefreshButton() {
    console.log('addRefreshButton called');
    
    // Check if button already exists
    if (document.getElementById('refresh-products-btn')) {
        console.log('Refresh button already exists, skipping');
        return;
    }
    
    const productGrid = document.getElementById('product-grid');
    const productsSection = document.getElementById('products');
    
    if (!productGrid || !productsSection) {
        console.log('Product grid or section not found, will retry later');
        setTimeout(addRefreshButton, 1000);
        return;
    }
    
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refresh-products-btn';
    refreshBtn.className = 'refresh-btn';
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Products';
    
    refreshBtn.onclick = () => {
        console.log('Manual refresh clicked');
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            loadProducts();
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Products';
            refreshBtn.disabled = false;
        }, 300);
    };
    
    // Add refresh button near product grid
    const header = productsSection.querySelector('h2');
    if (header) {
        const refreshContainer = document.createElement('div');
        refreshContainer.style.cssText = 'text-align: center; margin: 1rem 0;';
        refreshContainer.appendChild(refreshBtn);
        header.insertAdjacentElement('afterend', refreshContainer);
        console.log('Refresh button added successfully');
    }
} 