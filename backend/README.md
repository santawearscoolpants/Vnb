# VNB Backend - Django REST API

Backend API for Vines & Branches E-commerce Platform

## Setup Instructions

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## Admin Panel

Access the admin panel at: http://localhost:8000/admin

## API Endpoints

### Store
- GET `/api/store/categories/` - List all categories
- GET `/api/store/products/` - List all products
- GET `/api/store/products/{slug}/` - Get product details
- GET `/api/store/products/featured/` - Get featured products
- POST `/api/store/newsletter/` - Subscribe to newsletter
- POST `/api/store/contact/` - Submit contact form
- POST `/api/store/investment/` - Submit investment inquiry

### Accounts
- POST `/api/accounts/users/` - Register new user
- POST `/api/accounts/users/login/` - Login
- POST `/api/accounts/users/logout/` - Logout
- GET `/api/accounts/users/me/` - Get current user

### Orders
- GET `/api/orders/cart/current/` - Get current cart
- POST `/api/orders/cart/add_item/` - Add item to cart
- POST `/api/orders/cart/update_item/` - Update cart item
- POST `/api/orders/cart/remove_item/` - Remove cart item
- POST `/api/orders/cart/clear/` - Clear cart
- POST `/api/orders/orders/` - Create order
- GET `/api/orders/orders/` - List user orders
