"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ClientProviders({
  children,
  attribute,
  defaultTheme,
  enableSystem,
  storageKey,
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
}) {
  return (
    <SessionProvider>
      {" "}
      {/* Ensuring NextAuth session is managed globally */}
      <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
    </SessionProvider>
  );
}

// Theme provider logic that prevents SSR mismatches
function ThemeProviderWrapper({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>{" "}
        {/* Improves user experience instead of blank render */}
      </div>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="my-application-key"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
