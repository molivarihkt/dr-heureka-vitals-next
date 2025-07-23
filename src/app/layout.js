import {Geist, Geist_Mono} from "next/font/google";
import "./../../public/css/variables.css"
import "./globals.css";
import "./../../public/css/styles.css"
import {Header} from "@/components/Header";
import {I18NProvider, LineValidatorProvider} from "@/app/providers";
import {numberWhitelist} from "@/constants";
import {Suspense} from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({children}) {
  return (
    <I18NProvider>
      <html lang="es">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
          <title>BCare Vitals™</title>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <Suspense>
            <LineValidatorProvider numberWhitelist={numberWhitelist}>
              <Header/>
              {children}
            </LineValidatorProvider>
          </Suspense>
        </body>
      </html>
    </I18NProvider>
  );
}
