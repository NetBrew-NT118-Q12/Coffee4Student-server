# NetBrew

## How to build

- Step 1: Clone the repository.

```bash
git clone https://github.com/NetBrew-NT118-Q12/Coffee4Student-server.git
cd frontend
```

- Step 2: Create environment variables.

Create .env file where your API_URL will be placed. 

- Step 2: Install dependencies

```bash
npm install
```

> Note: If running `npm install` fails with an ERESOLVE / peer dependency conflict (for example, an error like "npm ERR! code ERESOLVE" or "Could not resolve dependency" mentioning packages such as `react-helmet-async` vs `react`), try installing with legacy peer deps:

```bash
npm install --legacy-peer-deps
```

This command tells npm to ignore peer dependency conflicts and often allows the installation to complete in development environments. If the problem persists, you can try `npm install --force` or resolve the conflict by updating the conflicting packages to compatible versions.

- Step 3: Run the development server

```bash
npm run dev
```
The application will running on http://localhost:5173/admin/

- Step 4: Build for production

```bash
npm run build
```
After running this command, the folder dist will be created, commit this folder to dev branch, you will be able to access web at http://14.225.206.136/admin

If there is any change, you need to rebuild the app and commit again.

- Step 5: Enjoy the app!

## Available Scripts

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start development server with HMR                |
| `npm run build`   | Build for production (TypeScript check + bundle) |
| `npm run preview` | Preview production build locally                 |
| `npm run lint`    | Run ESLint to check code quality                 |

This README.md will be updated in the future.
