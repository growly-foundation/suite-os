# Intercom JWT Authentication Setup

This guide explains how to secure your Intercom installation with JSON Web Tokens (JWT) for enhanced security.

## Overview

The Intercom integration now uses JWT authentication to securely identify users. This provides:

- **Secure User Identification**: Users are authenticated using cryptographically signed tokens
- **Tamper Protection**: JWT tokens cannot be forged or modified
- **Expiration Control**: Tokens automatically expire after 1 hour
- **User Privacy**: Sensitive user data is protected

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Intercom Configuration
NEXT_PUBLIC_INTERCOM_APP_ID=your-intercom-app-id
INTERCOM_CLIENT_SECRET=your-intercom-client-secret
```

### 2. Get Your Intercom Credentials

1. **App ID**: Found in your Intercom app settings
2. **Client Secret**: Generate this in your Intercom app's authentication settings

### 3. How It Works

The JWT authentication flow works as follows:

1. **User Authentication**: When a user logs in, the system generates a JWT token
2. **Token Generation**: The JWT contains user information (ID, email, name) and is signed with your client secret
3. **Intercom Initialization**: The JWT is passed to Intercom as `user_hash` for secure authentication
4. **Automatic Refresh**: Tokens are automatically refreshed when needed

### 4. Security Features

- **Token Expiration**: JWT tokens expire after 1 hour for security
- **Cryptographic Signing**: All tokens are signed with your client secret
- **User Validation**: Only authenticated users receive JWT tokens
- **Fallback Support**: Falls back to basic authentication if JWT generation fails

## Implementation Details

### JWT Generation

The JWT token includes:

- `sub`: User ID
- `email`: User email address
- `name`: User display name
- `iat`: Token creation timestamp
- `exp`: Token expiration (1 hour from creation)

### API Endpoint

The JWT is generated via the `/api/intercom/jwt` endpoint:

```typescript
POST /api/intercom/jwt
{
  "userId": "user-id",
  "userEmail": "user@example.com",
  "userName": "User Name"
}
```

### React Hook

The `useIntercomJWT` hook manages JWT authentication:

```typescript
const { jwt, fetchJWT, error } = useIntercomJWT({
  userId: admin.id,
  userEmail: admin.email,
  userName: admin.name,
});
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   - Ensure `INTERCOM_CLIENT_SECRET` is set
   - Check that `NEXT_PUBLIC_INTERCOM_APP_ID` is configured

2. **JWT Generation Errors**

   - Verify your client secret is correct
   - Check that user data is available before JWT generation

3. **Intercom Not Loading**
   - Check browser console for JWT errors
   - Verify Intercom app ID is correct

### Debug Mode

Enable debug logging by checking the browser console for:

- JWT generation status
- Intercom initialization logs
- Authentication errors

## Security Best Practices

1. **Keep Secrets Secure**: Never expose `INTERCOM_CLIENT_SECRET` in client-side code
2. **Rotate Secrets**: Regularly rotate your Intercom client secret
3. **Monitor Usage**: Monitor JWT generation for unusual patterns
4. **Token Validation**: Intercom validates tokens server-side

## Migration from Basic Auth

If you're upgrading from basic Intercom authentication:

1. Add the new environment variables
2. Deploy the updated code
3. The system will automatically use JWT authentication
4. No changes needed to existing Intercom conversations

## Support

For issues with JWT authentication:

1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test JWT generation via the API endpoint
4. Contact the development team if issues persist
