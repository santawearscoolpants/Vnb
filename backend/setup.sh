#!/bin/bash

echo "Setting up VNB Django Backend..."

python3 -m venv venv

if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
fi

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Creating .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Creating media directory..."
mkdir -p media/products media/categories

echo ""
echo "Setup complete!"
echo ""
echo "To create a superuser, run:"
echo "  python manage.py createsuperuser"
echo ""
echo "To start the server, run:"
echo "  python manage.py runserver"
