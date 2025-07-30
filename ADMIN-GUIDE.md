# 🛡️ Admin Panel Guide - Golden Crumb Biscuit Company

Your biscuit shop website now has a complete admin panel for managing products, orders, and customer messages!

## 🚀 Getting Started

### Accessing the Admin Panel
1. Navigate to: `your-website.com/admin/` (or `yoursite/admin/` if in a subfolder)
2. Or click "Admin Panel" in the website footer
3. Use the default credentials:
   - **Username:** `admin`
   - **Password:** `goldencrumb2024`

⚠️ **Important:** Change these credentials in `admin/index.php` for production use!

## 🏠 Admin Dashboard

The dashboard provides an overview of your business:
- **Total Products** - Current number of items in your catalog
- **Total Orders** - Customer orders received
- **Revenue** - Total sales amount
- **Contact Messages** - Customer inquiries

### Quick Actions
- **Manage Products** - View and edit existing products
- **Add New Product** - Create new items for your catalog
- **View Orders** - See customer orders (placeholder)
- **View Messages** - Read customer contact forms (placeholder)

## 🛒 Product Management

### Adding New Products
1. Click "Add New Product" from the dashboard
2. Fill in all required fields:
   - **Product Name** - e.g., "Chocolate Chip Cookies"
   - **Price** - Must be greater than 0
   - **Category** - Sweet, Savory, or Specialty
   - **Image Path** - e.g., "images/chocolate-chip.jpg"
   - **Description** - Detailed product description
   - **Ingredients** - Comma-separated list
   - **In Stock** - Check if available
   - **Featured** - Check to highlight on homepage

### Managing Existing Products
1. Go to "Manage Products" from the dashboard
2. View all products in a table format
3. See product statistics at the top
4. Use action buttons to edit or delete products

### Product Categories
- **Sweet** - Cookies, sweet biscuits, dessert items
- **Savory** - Crackers, cheese biscuits, savory snacks
- **Specialty** - Unique or seasonal items

## 🔒 Security Features

### Authentication
- Session-based login system
- Automatic logout for inactive sessions
- Password protection for all admin pages
- Redirect to login if not authenticated

### Input Validation
- All form inputs are sanitized
- Required field validation
- Price format validation
- XSS protection with htmlspecialchars()

### File Protection
- Admin files protected from direct access
- Session management with secure cookies
- Proper error handling

## 📁 File Structure

```
admin/
├── index.php          # Login page
├── dashboard.php      # Main admin dashboard
├── add-product.php    # Add new products
├── manage-products.php # View/manage existing products
├── logout.php         # Logout functionality
└── css/
    └── admin.css      # Admin panel styling
```

## 🎨 Customization

### Changing Admin Credentials
Edit `admin/index.php`:
```php
$admin_username = 'your_username';
$admin_password = 'your_secure_password';
```

### Adding More Admin Users
Currently supports single admin. For multiple users:
1. Create a database table for admin users
2. Hash passwords using `password_hash()`
3. Update login logic in `index.php`

### Customizing Colors
Edit `admin/css/admin.css` and modify CSS variables:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... other variables ... */
}
```

## 🔧 Technical Details

### How Product Data is Stored
- Products are stored in `php/products.php` as a PHP array
- Admin panel reads and writes to this file
- Automatic ID assignment for new products
- Backup approach before implementing databases

### Session Management
- PHP sessions used for authentication
- Session expires on browser close
- Automatic cleanup on logout
- Session data includes username and login time

### Form Processing
- POST method for all form submissions
- Server-side validation for all inputs
- Success/error messages for user feedback
- CSRF protection through session verification

## 🚀 Advanced Features

### Future Enhancements
The admin panel is built to be extensible:

1. **Database Integration**
   - Replace file-based storage with MySQL/PostgreSQL
   - Add proper relationships between tables
   - Implement data migrations

2. **User Management**
   - Multiple admin accounts
   - Role-based permissions
   - Activity logging

3. **Enhanced Product Management**
   - Bulk product operations
   - Image upload functionality
   - Inventory tracking
   - Product variants (sizes, flavors)

4. **Order Management**
   - View and process customer orders
   - Order status updates
   - Customer notifications
   - Sales reports

5. **Analytics Dashboard**
   - Sales charts and graphs
   - Customer behavior tracking
   - Popular products analysis
   - Revenue trends

## 🐛 Troubleshooting

### Common Issues

**Can't Access Admin Panel**
- Check PHP is enabled on your web server
- Verify URL: `yoursite.com/admin/` or `yoursite/admin/`
- Ensure file permissions allow PHP execution
- Make sure your web server supports PHP sessions

**Login Not Working**
- Verify credentials in `admin/index.php`
- Check for typos in username/password
- Clear browser cache and cookies

**Can't Add Products**
- Check file permissions on `php/products.php`
- Ensure all required fields are filled
- Verify image paths are correct

**Products Not Showing on Website**
- Clear browser cache
- Check `php/products.php` for syntax errors
- Verify product data format

### Getting Help
- Check browser console for JavaScript errors
- Review PHP error logs
- Ensure all files are in correct directories
- Test with fresh PHP session (logout/login)

## 📋 Best Practices

### Security
- Change default credentials immediately
- Use HTTPS in production
- Regularly backup your data
- Monitor admin access logs

### Content Management
- Use high-quality product images
- Write detailed, engaging descriptions
- Keep ingredients lists accurate
- Regular inventory updates

### Performance
- Optimize images before uploading
- Monitor file sizes
- Consider caching for better performance
- Regular cleanup of old data

---

## 🎉 Congratulations!

Your Golden Crumb Biscuit Company website now has a complete admin panel! You can manage products, view statistics, and maintain your online presence with ease.

**Next Steps:**
1. Change the default login credentials
2. Add your real product images
3. Create your first custom product
4. Explore all the admin features

Happy baking! 🍪 