# Backend Setup Guide

## Quick Start

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Run setup script
```bash
bash setup.sh
```

### 3. Create superuser
```bash
python manage.py createsuperuser
```

### 4. Start the server
```bash
python manage.py runserver
```

The backend will be available at: http://localhost:8000

## Admin Panel

Access the admin panel at: http://localhost:8000/admin

Use the superuser credentials you created to log in.

## Features in Admin Panel

### Store Management
- **Categories**: Create and manage product categories
  - Upload category images
  - Set active/inactive status
  - View product count per category

- **Products**: Full product management
  - Set product name, description, price
  - Upload main product image
  - Manage stock quantity
  - Set featured status
  - Add multiple product images
  - Add color variations
  - Add size options
  - Add product details

- **Newsletter Subscribers**: View and manage newsletter subscriptions

- **Contact Messages**: View customer inquiries

- **Investment Inquiries**: Track investment interest

### User Accounts
- **Users**: Manage customer accounts
- **User Profiles**: View detailed customer information

### Order Management
- **Orders**: View and manage all orders
  - Update order status
  - View order items
  - Track shipping information

- **Carts**: Monitor active shopping carts

## API Endpoints

All endpoints are prefixed with `/api/`

### Store Endpoints
- `GET /store/categories/` - List categories
- `GET /store/products/` - List products
- `GET /store/products/{slug}/` - Product details
- `GET /store/products/featured/` - Featured products
- `POST /store/newsletter/` - Newsletter subscription
- `POST /store/contact/` - Contact form
- `POST /store/investment/` - Investment inquiry

### Account Endpoints
- `POST /accounts/users/` - User registration
- `POST /accounts/users/login/` - Login
- `POST /accounts/users/logout/` - Logout
- `GET /accounts/users/me/` - Current user info

### Order Endpoints
- `GET /orders/cart/current/` - Get cart
- `POST /orders/cart/add_item/` - Add to cart
- `POST /orders/cart/update_item/` - Update cart
- `POST /orders/cart/remove_item/` - Remove from cart
- `POST /orders/cart/clear/` - Clear cart
- `POST /orders/orders/` - Create order
- `GET /orders/orders/` - List orders

## Frontend Integration

### 1. Create .env file in frontend
```bash
cd ..
cp .env.example .env
```

### 2. Update .env with backend URL
```
VITE_API_URL=http://localhost:8000/api
```

### 3. Start frontend
```bash
npm install
npm run dev
```

## Adding Sample Products

1. Log into admin panel
2. Create categories (e.g., Suits, Shoes, Sandals, Fragrances, Jewelleries)
3. Add products with images, prices, colors, and sizes
4. Set some products as featured
5. Products will automatically appear on the frontend

## Database

The setup uses SQLite by default. The database file is `db.sqlite3`.

To reset the database:
```bash
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## Production Deployment

For production:
1. Set `DEBUG=False` in settings.py
2. Update `ALLOWED_HOSTS` with your domain
3. Use PostgreSQL instead of SQLite
4. Configure proper static file serving
5. Use environment variables for sensitive data
6. Set up HTTPS
