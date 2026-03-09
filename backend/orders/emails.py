from django.core.mail import send_mail
from django.conf import settings


def send_order_confirmation(order):
    """Send order confirmation email after successful payment."""
    items_text = ''
    for item in order.items.all():
        items_text += f'  - {item.product_name} (x{item.quantity}) — {order.payment_currency} {item.subtotal}\n'

    body = (
        f"Hello {order.first_name or 'there'},\n\n"
        f"Thank you for your order! Here are your order details:\n\n"
        f"Order Number: {order.order_number}\n"
        f"Date: {order.created_at.strftime('%d %B %Y')}\n\n"
        f"Items:\n{items_text}\n"
        f"Subtotal: {order.payment_currency} {order.subtotal}\n"
        f"Tax: {order.payment_currency} {order.tax}\n"
        f"Shipping: {'Free' if not order.shipping else f'{order.payment_currency} {order.shipping}'}\n"
        f"Total: {order.payment_currency} {order.total}\n\n"
        f"Shipping to:\n"
        f"  {order.first_name} {order.last_name}\n"
        f"  {order.address}\n"
        f"  {order.city}, {order.state} {order.zip_code}\n"
        f"  {order.country}\n\n"
        f"We'll notify you when your order ships.\n\n"
        f"Thank you for shopping with Vines & Branches!\n\n"
        f"— The VNB Team"
    )

    try:
        send_mail(
            subject=f'Order Confirmed — {order.order_number}',
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.email],
            fail_silently=True,
        )
    except Exception:
        pass


def send_shipping_update(order, tracking_number=None):
    """Send shipping notification when order status changes to shipped."""
    tracking_text = ''
    if tracking_number:
        tracking_text = f'Tracking Number: {tracking_number}\n\n'

    body = (
        f"Hello {order.first_name or 'there'},\n\n"
        f"Great news! Your order {order.order_number} has been shipped.\n\n"
        f"{tracking_text}"
        f"Shipping to:\n"
        f"  {order.first_name} {order.last_name}\n"
        f"  {order.address}\n"
        f"  {order.city}, {order.state} {order.zip_code}\n"
        f"  {order.country}\n\n"
        f"Thank you for shopping with Vines & Branches!\n\n"
        f"— The VNB Team"
    )

    try:
        send_mail(
            subject=f'Your Order Has Shipped — {order.order_number}',
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.email],
            fail_silently=True,
        )
    except Exception:
        pass
