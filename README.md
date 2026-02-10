# Florian - Personal Site (Open Source Portfolio)

A personal site differs from a portfolio. While a portfolio is mainly used to demonstrate work to a potential employer, I use my personal site to express myself as a design engineer. I have purposefully open-sourced this page so that others can get inspired, copy pieces of it, or use it as a starting point for their own personal site.

## Usage
### Technology

My tech stack can be found on my [colophon](https://floriankiem.com/colophon) page. Here's a quick overview:

- Icons with the [Central Icon System](https://centralicons.com/) package.
- Custom [Vercel API](https://vercel.com/guides/hosting-backend-apis) endpoints
- - AI Chat stream via the AI-SDK
  - Custom OG image endpoints
- Free moderation AI by OpenAI
- [Vike](https://vike.dev/new) as Vite frontend with great SSR capabilities and full customizability
- Custom UI inspired by baseui and shadcn
- Dynamic markdown roots with a custom markdown renderer
- Custom folder setup via `src`
- Tailwind 4
- Realtime Firebase DB
- Custom ThreeJS model reacting in realtime to API responses

### Getting started 

To start, copy the repository and install dependencies (Note that you need to have [bun](https://bun.com/docs/installation) installed).
```
bun i
```

As I'm using the central icon system you'll receive an error when trying to install the icon package. You either need to remove all icons and the package from the repository or buy a license key on their website.

After that, you can start the repository.
```
bun dev
```

### Custom Vercel Endpoints (API folder)

To use this repository with the api folder, install the dependencies as mentioned above (Note that you need to have the [Vercel CLI](https://vercel.com/docs/cli/install) installed).
Then, login via `vercel login` and choose your desired org and project.

After that, copy the `.env.example` file from the root directory and call it `.env`. It shouldn't be included in your commits and already be excluded by the gitignore.

If you'd like to use the same stack as myself, you need to create a new firebase projects and copy your credentials over. Repeat the same for OpenAI. If you followed the steps above, you likely already removed the central icon license key from the enviornment variables or added the key. 

After you added all of the environment variable, the endpoints should work automatically.


## Questions and support

I'm always eager to help, please reach out to me on X (Twitter) [@flornkm](https://x.com/flornkm). I can't promise to answer every message but will do my best.

---

As a last note, even tho I open-sourced my personal site completely, I don't like to see 1:1 copies of it being advertised as the work of others, as it obviously cost some time to build everything. Selling this repository as a product, e.g. portfolio template, will result in legal action.
