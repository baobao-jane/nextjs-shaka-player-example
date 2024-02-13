This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# nextjs-shaka-player-example

This simple project contains the implementation of Shaka Player with Next.js and TypeScript.
This example includes support for Widevine and FairPlay DRM."

Since Next.js has built-in support for SSR, and Shaka Player doesn't support it, you need to load Shaka Player with:

```javascript
import dynamic from 'next/dynamic';
```

Shaka Player doesn't have built-in TypeScript support. Therefore, you have to create a global.d.ts file to provide TypeScript support. Additionally, check the tsconfig.json file and ensure the following options are included:

```json
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "global.d.ts"],
  "exclude": ["node_modules"],
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx"]
```

This version aims to improve the clarity and readability of your instructions.

## Getting Started

```bash
git clone https://github.com/your-username/nextjs-shaka-player-example.git
cd nextjs-shaka-player-example
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Editional explanation for FairPlay DRM

When playing HLS files using FairPlay DRM and installing **PatchedMediaKeysApple**(it is not a modern eme) with `shaka.polyfill.PatchedMediaKeysApple.install();`, 

the issue arises when executing `shaka.util.FairPlayUtils.defaultGetContentId`. 

When the `initDataTypes` is "skd" and the value contains "/", it is interpreted as a path. 

Consequently, only the portion before "/" is used as contentId, leading to authentication failure.

