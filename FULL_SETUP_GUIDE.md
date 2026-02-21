# Vines & Branches - Complete Setup Guide

Complete e-commerce platform with React frontend and Django backend.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Django + Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Admin Panel**: Django Admin (full CRUD operations)

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip and virtualenv

## Complete Setup (From Scratch)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin panel
python manage.py createsuperuser
# Enter username, email, and password when prompted

# Create media directories
mkdir -p media/products media/categories

# Start backend server
python manage.py runserver
```

Backend will be running at: **http://localhost:8000**

Admin panel at: **http://localhost:8000/admin**

### Step 2: Frontend Setup

Open a new terminal window:

```bash
# Navigate back to project root (if in backend/)
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# The .env file should contain:
# VITE_API_URL=http://localhost:8000/api

# Start frontend development server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

## Admin Panel Usage

### 1. Access Admin Panel
- URL: http://localhost:8000/admin
- Login with superuser credentials

### 2. Add Categories
- Go to "Store Management" → "Categories"
- Click "Add Category"
- Fill in:
  - Name (e.g., "Suits", "Shoes", "Sandals", "Fragrances", "Jewelleries")
  - Description
  - Upload image (optional)
  - Set as Active
- Click "Save"

### 3. Add Products
- Go to "Store Management" → "Products"
- Click "Add Product"
- Fill in basic information:
  - Category (select from dropdown)
  - Name
  - Description
  - Price
  - Stock Quantity
  - Upload main image
- Set status:
  - Is Active (checkbox)
  - Is Featured (checkbox for homepage display)
- Add variations (inline forms at bottom):
  - Product Images (multiple images for gallery)
  - Colors (name and hex code, e.g., "Black", "#000000")
  - Sizes (e.g., "38", "39", "40")
  - Details (bullet points like "Made in Italy")
- Click "Save"

### 4. Product Management Features
- **Change prices**: Edit product → Update price → Save
- **Manage stock**: Edit product → Update stock quantity → Save
- **Upload images**: Add multiple images through Product Images inline
- **Set featured**: Check "Is Featured" to display on homepage
- **Deactivate**: Uncheck "Is Active" to hide from frontend

### 5. Order Management
- View all orders in "Order Management" → "Orders"
- Update order status (Pending → Processing → Shipped → Delivered)
- View order items and customer information
- Track shipping details

### 6. Customer Management
- View users in "User Accounts" → "Users"
- View detailed profiles in "User Profiles"
- See newsletter subscribers
- Read contact messages
- Review investment inquiries

## API Integration

The frontend automatically connects to the backend through the API service (`src/services/api.ts`).

### Key Features:
- Newsletter subscription
- Contact form submission
- Investment inquiries
- Product browsing (categories, featured, search)
- Shopping cart (add, update, remove)
- Order placement
- User authentication

## Testing the Integration

### 1. Add Sample Products in Admin
- Create 2-3 categories
- Add 5-10 products with images
- Set some as featured

### 2. Browse Frontend
- View categories on homepage
- Click category to see products
- Click product to view details

### 3. Test Newsletter
- Enter email in newsletter form
- Check admin panel for subscription

### 4. Test Contact Form
- Fill out contact form
- Check admin panel for message

### 5. Test Investment Form
- Submit investment inquiry
- Check admin panel for inquiry

## Development Workflow

### Running Both Servers

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Making Changes

**Backend Changes:**
- Models: Update `backend/*/models.py` → Run migrations
- Admin: Update `backend/*/admin.py`
- API: Update `backend/*/views.py` and `backend/*/serializers.py`

**Frontend Changes:**
- Components: Edit files in `src/components/`
- Pages: Edit files in `src/pages/`
- API calls: Update `src/services/api.ts`

## Database Migrations

When you change models:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Building for Production

### Frontend:
```bash
npm run build
# Output in build/ directory
```

### Backend:
```bash
cd backend
pip install gunicorn
gunicorn vnb_backend.wsgi:application
```

## Common Issues & Solutions

### Issue: CORS errors
**Solution**: Ensure backend is running and CORS is configured in `settings.py`

### Issue: Products not showing
**Solution**:
- Check products are marked "Is Active" in admin
- Verify backend is running
- Check browser console for API errors

### Issue: Images not loading
**Solution**:
- Ensure media/ directory exists in backend
- Check MEDIA_URL and MEDIA_ROOT in settings.py
- Verify images are uploaded in admin panel

### Issue: Can't login to admin
**Solution**: Create superuser again:
```bash
python manage.py createsuperuser
```

## File Structure

```
project/
├── backend/                  # Django backend
│   ├── vnb_backend/         # Main settings
│   ├── store/               # Product management app
│   ├── accounts/            # User management app
│   ├── orders/              # Order & cart management app
│   ├── media/               # Uploaded files
│   └── manage.py
├── src/                     # React frontend
│   ├── components/          # Reusable components
│   ├── pages/               # Page components
│   ├── services/            # API service
│   └── context/             # Context providers
└── build/                   # Production build (after npm run build)
```

## Features Implemented

### Frontend Features:
- Responsive design
- Category browsing
- Product listings
- Product details with variants
- Shopping cart
- Newsletter subscription
- Contact form
- Investment inquiry form
- User authentication pages

### Backend Features:
- Full CRUD for products
- Category management
- Image uploads
- Product variants (colors, sizes)
- Shopping cart system
- Order management
- User profiles
- Newsletter management
- Contact message tracking
- Investment inquiry tracking
- REST API with pagination
- Admin panel with full control

### Admin Panel Features:
- Product management (add, edit, delete, upload images)
- Change prices instantly
- Manage stock levels
- Upload multiple product images
- Add color variations
- Add size options
- Set featured products
- Order status updates
- View customer information
- Read messages and inquiries

## Next Steps

1. Add payment integration (Stripe, PayPal)
2. Implement email notifications
3. Add product reviews and ratings
4. Implement advanced search and filters
5. Add wish list functionality
6. Implement order tracking
7. Add analytics dashboard
8. Set up automated backups

## Support

For issues or questions:
- Check Django logs in terminal
- Check browser console for frontend errors
- Verify both servers are running
- Check database migrations are up to date

## License

All rights reserved - Vines & Branches 2025
