import "./globals.css";

export const metadata = {
  title: "FieldFlow",
  description: "Portal do Analista",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#F5F7FA] text-[#101828] antialiased">
        {children}
      </body>
    </html>
  );
}