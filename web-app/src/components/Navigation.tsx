'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children, className = '' }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-md transition ${isActive ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'} ${className}`}
    >
      {children}
    </Link>
  );
};

const Navigation = () => {
  const { isSignedIn } = useUser();
  
  return (
    <nav className="bg-white shadow-sm py-3 mb-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold text-blue-600">JobJedi</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <NavLink href="/">Jobs</NavLink>
              <NavLink href="/resumes">Resumes</NavLink>
            </div>
            <div className="ml-4">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
