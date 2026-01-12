# Environment Variables Setup

This guide explains how to configure all environment variables for the DKN server.

## Quick Setup

1. Create a `.env` file in the `server/` directory
2. Copy the template below and fill in your values
3. See detailed instructions for email setup in [EMAIL_SETUP.md](./EMAIL_SETUP.md)

## Environment Variables Template

Create a `.env` file in the `server/` directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dkn_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Service Configuration (Gmail SMTP)
# IMPORTANT: You need to generate a Gmail App Password (not your regular password)
# See EMAIL_SETUP.md for detailed instructions
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL (for email links - verification, password reset, invitations)
FRONTEND_URL=http://localhost:5173

# Email Verification Configuration (Optional)
REQUIRE_EMAIL_VERIFICATION=false
EMAIL_VERIFICATION_EXPIRES_IN=24h
PASSWORD_RESET_EXPIRES_IN=1h

# File Upload Configuration
UPLOAD_DIR=./uploads
```

## Required Variables

### Database
- **DATABASE_URL**: PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database_name`
  - Example: `postgresql://postgres:password@localhost:5432/dkn_db`

### JWT Authentication
- **JWT_SECRET**: Secret key for signing JWT tokens (use a strong random string in production)
- **JWT_EXPIRES_IN**: Token expiration time (default: "7d")

### Email Service (Required for email verification and password reset)
- **EMAIL_USER**: Your Gmail email address
- **EMAIL_PASSWORD**: Gmail App Password (16 characters, NOT your regular password)
- **EMAIL_HOST**: SMTP host (default: smtp.gmail.com)
- **EMAIL_PORT**: SMTP port (default: 587)
- **EMAIL_SECURE**: Use TLS/SSL (default: false for port 587)
- **EMAIL_FROM**: Sender email address (defaults to EMAIL_USER)
- **FRONTEND_URL**: Frontend URL for email links

## Optional Variables

- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment (development, production, test)
- **CORS_ORIGIN**: Allowed CORS origin (default: http://localhost:5173)
- **REQUIRE_EMAIL_VERIFICATION**: Require email verification before login (default: false)
- **EMAIL_VERIFICATION_EXPIRES_IN**: Verification token expiration (default: 24h)
- **PASSWORD_RESET_EXPIRES_IN**: Password reset token expiration (default: 1h)
- **UPLOAD_DIR**: Directory for file uploads (default: ./uploads)

## Email Setup Instructions

**IMPORTANT**: For email verification and password reset to work, you MUST configure the email service.

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed Gmail setup instructions.

### Quick Gmail Setup:

1. Enable 2FA on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password
4. Add to `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

## Security Notes

⚠️ **Never commit your `.env` file to version control!**

- The `.env` file should be in `.gitignore`
- Use different values for development and production
- Generate strong, random values for `JWT_SECRET` in production
- Keep your Gmail App Password secure

## Testing Email Configuration

After setting up your `.env` file:

1. Restart your server
2. Try signing up a new user
3. Check your server logs - you should see "✅ Email sent successfully" instead of the warning
4. Check the user's email inbox (and spam folder) for the verification email
