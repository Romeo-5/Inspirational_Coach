import "./globals.css";
import { Inter } from "next/font/google";
import { UserProvider } from "./context/UserContext";
import { DarkModeProvider } from "./context/DarkModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Inspirational Coach",
  description: "Find daily inspiration and track your goals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <DarkModeProvider>
            {children}
          </DarkModeProvider>
        </UserProvider>
      </body>
    </html>
  );
}