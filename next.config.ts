import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "article.bespes-jt.com" },
      { protocol: "https", hostname: "assets.mixkit.co" },
      { protocol: "https", hostname: "att-japan.net" },
      { protocol: "https", hostname: "collectionapi.metmuseum.org" },
      { protocol: "https", hostname: "d3w13n53foase7.cloudfront.net" },
      { protocol: "https", hostname: "guidetokyoto.com" },
      { protocol: "https", hostname: "images.travelandleisureasia.com" },
      { protocol: "https", hostname: "learnjapanese123.com" },
      { protocol: "https", hostname: "newsdig.ismcdn.jp" },
      { protocol: "https", hostname: "osaka.b-cdn.net" },
      { protocol: "https", hostname: "photos.smugmug.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "rimage.gnst.jp" },
      { protocol: "https", hostname: "thetokyofiles.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "www.alljapanrelocation.com" },
      { protocol: "https", hostname: "www.kuronekoyamato.co.jp" },
      { protocol: "https", hostname: "www.nagoya-info.jp" },
      { protocol: "https", hostname: "www.nagoyaisnotboring.com" },
      { protocol: "https", hostname: "www.tokyoupdates.metro.tokyo.lg.jp" },
      { protocol: "https", hostname: "*.edgeone.dev" },
    ],
  },
};

export default withNextIntl(nextConfig);
