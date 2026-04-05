-- Remove test signup user vnbwayltd@gmail.com (e.g. after switching Auth email to Resend).
-- If this errors on FK violations, delete the user from Dashboard → Authentication → Users instead.

delete from auth.users where email = 'vnbwayltd@gmail.com';
