<div align="center">
<h1>
<img src="public/favicon.png" alt="shapeit logo" width="128" height="128"> 
<br> 
shapeit

</h1>

[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://shapeit-murex.vercel.app)
[![Deployment](https://img.shields.io/github/deployments/BananaJeanss/shapeit/Production?style=for-the-badge&logo=vercel)](https://github.com/BananaJeanss/shapeit/deployments)
[![License](https://img.shields.io/github/license/BananaJeanss/shapeit?style=for-the-badge)](https://github.com/BananaJeanss/shapeit/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/BananaJeanss/shapeit?style=for-the-badge)](https://github.com/BananaJeanss/shapeit/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/BananaJeanss/shapeit?style=for-the-badge)](https://github.com/BananaJeanss/shapeit/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/BananaJeanss/shapeit?style=for-the-badge)](https://github.com/BananaJeanss/shapeit/issues)
[![Repo Size](https://img.shields.io/github/repo-size/bananajeanss/shapeit?style=for-the-badge)](https://github.com/BananaJeanss/shapeit)

https://shapeit-murex.vercel.app

<b>A social media where you react with shapes</b>

</div>

---

## Description

shapeit is a pretty basic social media app where you can post your thoughts, media, and react with shapes, and supports login via GitHub.

Built on next.js, react, and tailwindcss.

## Features

- Basic OAuth login with GitHub
- Post thoughts up to 365 characters, and up to 4 images (PNGs, GIFs, SVGs, WEBPs, and more probably)
- React with shapes (Triangle, Circle, Square, Diamond, Hexagon)
- Profile pages with user PFP, username, and bio from GitHub, as well as a link to the GitHub profile, and user posts display.
- Vercel integration with Vercel Blobs, Neon Postgres, Speed Insights, and Analytics.

## Regular Usage Quick Start

1. Go to https://shapeit-murex.vercel.app.
2. Login with your GitHub account.
3. Start posting, reacting, etc!

> [!NOTE]
> There's a 10 post per 30 minutes ratelimit set, and you can upload up to 16mb total per post.

## Development Quick Start

1. Install required dependencies:

   ```bash
   npm install
   ```

2. Setup environment variables:
   ```bash
   cp .env.example .env
   cp .env.local.example .env.local
   ```

> [!IMPORTANT]
> Make sure you actually put the required variables in `.env` and `.env.local` files.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and go to [http://localhost:3000](http://localhost:3000).

## Contributing

Contributions are welcome! Feel free to do the following:

- Open an issue if you spot an bug/issue.
- Open a issue if you have a feature request.
- Fork the repository and open a pull request if you want to contribute code.
- Be respectful and use common sense.

### Contributors

[![contributors](https://contributors-img.web.app/image?repo=BananaJeanss/shapeit)](https://github.com/BananaJeanss/shapeit/graphs/contributors)

## License

This project is licensed under GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <a href="https://shipwrecked.hackclub.com/?t=ghrm" target="_blank">
    <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/739361f1d440b17fc9e2f74e49fc185d86cbec14_badge.png" 
         alt="This project is part of Shipwrecked, the world's first hackathon on an island!" 
         style="width: 35%;">
  </a>
</div>
