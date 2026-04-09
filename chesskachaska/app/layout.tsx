import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Montserrat,
  Newsreader,
  Roboto_Mono,
  Inter
} from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});
const inter = Inter({
  subsets : ["latin"],
  variable : "--font-inter"
})

export const metadata: Metadata = {
  title: "Onxy Gambit",
  description: "A refined chess experience built with Next.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={[
          inter.variable,
          geist.variable,
          geistMono.variable,
          montserrat.variable,
          newsreader.variable,
          robotoMono.variable,
          "min-h-full bg-bg-primary text-text-primary",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
