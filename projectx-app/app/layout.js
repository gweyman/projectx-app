import './globals.css';

export const metadata = {
  title: 'Project X',
  description: 'Intelligent arm development for throwers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
