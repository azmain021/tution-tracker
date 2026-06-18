import { ReactNode } from 'react';
import '@/styles/globals.css';

export const metadata = {
  title: 'TutorTrack',
  description: 'Home tutor visit tracker',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-primary text-text-primary">
        <div className="w-full min-h-screen max-w-[430px] mx-auto bg-bg-primary lg:max-w-none lg:mx-0">
          {children}
        </div>
      </body>
    </html>
  );
}
