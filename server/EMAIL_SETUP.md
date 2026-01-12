# Gmail Email Service Setup

This guide explains how to configure Gmail SMTP for sending invitation emails.

## Prerequisites

1. A Gmail account
2. Two-factor authentication (2FA) enabled on your Gmail account
3. An App Password generated for this application

## Step 1: Enable 2FA on Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", enable "2-Step Verification"
3. Follow the setup process

## Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Alternatively: Google Account → Security → 2-Step Verification → App passwords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter a name like "DKN Knowledge Network"
5. Click "Generate"
6. **Copy the 16-character password** (you won't see it again!)

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:5173
```

### Environment Variables Explained

- **EMAIL_HOST**: SMTP server host (default: `smtp.gmail.com`)
- **EMAIL_PORT**: SMTP port (default: `587` for TLS, use `465` for SSL)
- **EMAIL_SECURE**: Use TLS/SSL (default: `false` for port 587, use `true` for port 465)
- **EMAIL_USER**: Your Gmail email address
- **EMAIL_PASSWORD**: The 16-character App Password (NOT your regular Gmail password!)
- **EMAIL_FROM**: Email address shown as sender (default: EMAIL_USER)
- **FRONTEND_URL**: Your frontend URL for invitation links

## Important Notes

⚠️ **DO NOT use your regular Gmail password!**
- Gmail requires App Passwords for SMTP authentication
- Using your regular password will result in authentication errors
- App Passwords are 16 characters without spaces

⚠️ **Security Best Practices:**
- Never commit `.env` file to version control
- Store App Passwords securely
- Regenerate App Passwords if compromised
- Use different App Passwords for different environments (dev, staging, production)

## Testing

To test the email configuration, you can:

1. Start your server: `bun run dev`
2. Create an invitation via the API
3. Check the email inbox and spam folder

## Troubleshooting

### Authentication Failed (EAUTH error)
- ✅ Verify 2FA is enabled on your Gmail account
- ✅ Ensure you're using an App Password, not your regular password
- ✅ Check that EMAIL_USER and EMAIL_PASSWORD are set correctly
- ✅ Make sure there are no extra spaces in the App Password

### Emails not sending
- ✅ Check server logs for error messages
- ✅ Verify SMTP settings (host, port, secure)
- ✅ Check firewall/network restrictions
- ✅ Ensure Gmail account is not locked or restricted

### Emails going to spam
- ✅ Configure SPF/DKIM records for your domain (for production)
- ✅ Use a professional email address
- ✅ Include clear unsubscribe instructions
- ✅ Avoid spam trigger words

## Alternative Email Services

If you prefer not to use Gmail, you can use other email services:

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

For production, consider using a transactional email service like SendGrid, AWS SES, or Mailgun for better deliverability and reliability.

