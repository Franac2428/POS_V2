
import { Roboto } from "next/font/google";
import Sidebar from "../components/sidebar";
import "@/app/globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import Providers from "../Providers";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata = {
  title: "Soda Santa Ana",
  description: "Restaurante",
};

export default function DashboardLayout({ children }) {
  const pageTitle = metadata.title; // Título predeterminado, puedes hacerlo dinámico según la ruta si es necesario.

  return (
    <html lang="en">
      <head>
        <title>{pageTitle}</title>
      </head>
      <body className={`${roboto.className} bg-gray-50 dark:bg-gray-900 transition-all`}>
        <Providers>
          <Script src="https://kit.fontawesome.com/32bab276f2.js" crossOrigin="anonymous" />
          <NextTopLoader color="#ffff00" />
          <main className="flex overflow-hidden">
            {/* Sidebar fijo */}
            <Sidebar pageTitle={pageTitle} />
            <div className="overflow-auto p-2 h-screen w-full">
              <section>{children}</section>
            </div>
          </main>
          <Toaster expand={true} richColors position="bottom-right" duration={4000} />
        </Providers>
      </body>
    </html>
  );
}