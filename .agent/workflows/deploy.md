---
description: How to verify and deploy the application
---

Follow these steps to ensure a successful deployment:

1. **Local Build Verification**
   Run the build script locally to ensure there are no production-ready errors.
   ```bash
   yarn build
   ```

2. **Linting Check**
   Ensure code quality and consistency.
   // turbo
   3. Run the linting command
   ```bash
   yarn lint
   ```

3. **Check Environment Variables**
   Ensure all necessary production variables are set in your deployment environment (Vercel, VPS, etc.).

4. **Deploy to production**
   - **Vercel**: Push your changes to the `main` branch.
   - **Manual**: Run `yarn start` on your production server.
