import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Curated Playlist | Spotify",
  description: "Curated playlist in one click. Useful tool for playlist curators and record labels.",
  icons: {
    icon: "/spotify.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
