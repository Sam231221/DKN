# Fix npm run dev Permission Issue

The `npm run dev` command is failing due to a permission issue with the `.env.local` file.

## Quick Fix

Run these commands in your terminal:

```bash
cd /Users/admin/Documents/Developer/FullStackDev/DKN/client

# Remove extended attributes from .env.local
xattr -rc .env.local

# Fix file permissions
chmod 644 .env.local

# Try running dev again
npm run dev
```

## Alternative: Remove .env.local temporarily

If the above doesn't work, you can temporarily rename the file:

```bash
cd /Users/admin/Documents/Developer/FullStackDev/DKN/client
mv .env.local .env.local.backup
npm run dev
```

Then recreate `.env.local` if needed with:
```bash
echo "VITE_API_URL=http://localhost:3000" > .env.local
```

## Why this happens

macOS sometimes adds extended attributes to files that can cause permission issues. The `xattr -rc` command removes these attributes.
