from django.core.mail import send_mail
from django.conf import settings


def send_welcome_email(user):
    """Send welcome email on new account creation."""
    name = user.first_name or user.email

    body = (
        f"Hello {name},\n\n"
        f"Welcome to Vines & Branches — African Timeless Luxury.\n\n"
        f"Your account has been created successfully. "
        f"You can now browse our collections, save your favourites, "
        f"and enjoy a seamless checkout experience.\n\n"
        f"Visit us at: {settings.FRONTEND_URL}\n\n"
        f"If you have any questions, reply to this email or reach us at "
        f"care@vinesandbranches.com.\n\n"
        f"Welcome aboard!\n\n"
        f"— The VNB Team"
    )

    try:
        send_mail(
            subject='Welcome to Vines & Branches!',
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass
