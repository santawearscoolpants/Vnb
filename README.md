# Vines & Branches - Luxury E-commerce Platform

A complete, full-stack luxury e-commerce platform with React frontend and Django backend.

## Features

### Frontend (React + TypeScript)
- Beautiful, responsive UI with motion animations
- Product catalog with categories
- Product detail pages with variants (colors, sizes)
- Shopping cart functionality
- Newsletter subscription
- Contact form
- Investment inquiry system
- User authentication pages

### Backend (Django + DRF)
- RESTful API with Django REST Framework
- Full admin panel for product management
- Image upload support
- Shopping cart and order management
- User account management
- Newsletter and contact management
- Investment inquiry tracking
- CORS enabled for frontend integration

### Admin Panel Capabilities
- Add/Edit/Delete products
- Change product prices instantly
- Upload multiple product images
- Manage stock quantities
- Add color and size variants
- Set featured products
- Manage orders and update status
- View customer information
- Track messages and inquiries

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- pip

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Admin panel: http://localhost:8000/admin

### 2. Frontend Setup
```bash
npm install
npm run dev
```

Frontend: http://localhost:3000

## Detailed Documentation

- **[FULL_SETUP_GUIDE.md](FULL_SETUP_GUIDE.md)** - Complete setup instructions
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Backend-specific setup and API docs

## Project Structure

```
├── backend/              # Django backend
│   ├── vnb_backend/     # Settings & configuration
│   ├── store/           # Products & categories
│   ├── accounts/        # User management
│   ├── orders/          # Cart & orders
│   └── requirements.txt # Python dependencies
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── pages/           # Page components
│   ├── services/        # API integration
│   └── context/         # State management
└── package.json         # Node dependencies
```

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Django 5, Django REST Framework, Pillow
- **Database**: SQLite (dev) / PostgreSQL (production)
- **UI Components**: Radix UI, shadcn/ui

## Admin Panel Usage

1. Access http://localhost:8000/admin
2. Login with superuser credentials
3. Add categories and products
4. Upload product images
5. Set prices and stock quantities
6. Mark products as featured
7. Manage orders and customers

Products added in admin panel automatically appear on the frontend!

## API Endpoints

All endpoints: `/api/`

- **Store**: `/api/store/` - Products, categories, newsletter
- **Accounts**: `/api/accounts/` - User registration, login
- **Orders**: `/api/orders/` - Cart, orders

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for full API documentation.

## Development

Run both servers simultaneously:

Terminal 1 - Backend:
```bash
cd backend && python manage.py runserver
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Support

Original design: https://www.figma.com/design/yEQRJL1JxCwhZDgKncQYdu/E-commerce-Motion-Landing-Page

## License

All rights reserved - Vines & Branches 2025
