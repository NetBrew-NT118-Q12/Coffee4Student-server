# NetBrew

## How to build

- Step 1: Clone the repository.

```bash
git clone https://github.com/nguyendwctrung/NetBrew-Web-Admin.git
cd NetBrew
```

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

- Step 4: Build for production

```bash
npm run build
```

- Step 5: Enjoy the app!

## Available Scripts

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start development server with HMR                |
| `npm run build`   | Build for production (TypeScript check + bundle) |
| `npm run preview` | Preview production build locally                 |
| `npm run lint`    | Run ESLint to check code quality                 |

This README.md will be updated in the future.
