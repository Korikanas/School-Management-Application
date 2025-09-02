import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const isActive = (pathname) => {
    return router.pathname === pathname;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12L3 9V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V9L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12V18C9 18.5304 9.21071 19.0391 9.58579 19.4142C9.96086 19.7893 10.4696 20 11 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>School Directory</span>
        </div>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            href="/addSchool" 
            className={`nav-link ${isActive('/addSchool') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add School
          </Link>
          <Link 
            href="/showSchools" 
            className={`nav-link ${isActive('/showSchools') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17H7V11H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17ZM5 21C4.45 21 3.979 20.804 3.587 20.412C3.195 20.02 2.99934 19.5493 3 19V5C3 4.45 3.196 3.979 3.588 3.587C3.98 3.195 4.45067 2.99934 5 3H19C19.55 3 20.021 3.196 20.413 3.588C20.805 3.98 21.0007 4.45067 21 5V19C21 19.55 20.804 20.021 20.412 20.413C20.02 20.805 19.5493 21.0007 19 21H5Z" fill="currentColor"/>
            </svg>
            View Schools
          </Link>
          
          {/* LinkedIn Logo */}
          <a
            href="https://www.linkedin.com/in/naveenkorikanas/" 
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link linkedin-link"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg width="25" height="25" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span className="linkedin-text">LinkedIn</span>
          </a>
        </div>
        
        <div 
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <style jsx>{`
        .navbar {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }
        
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 20px;
          color: #1f2937;
        }
        
        .nav-logo svg {
          color: #3b82f6;
        }
        
        .nav-menu {
          display: flex;
          gap: 8px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .nav-link:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .nav-link.active {
          background: #eff6ff;
          color: #3b82f6;
        }
        
        .nav-link.linkedin-link:hover {
          background: #f3f4f6;
          color: #0a66c2;
        }
        
        .nav-link svg {
          flex-shrink: 0;
        }
        
        .nav-toggle {
          display: none;
          flex-direction: column;
          cursor: pointer;
          padding: 4px;
        }
        
        .nav-toggle span {
          width: 25px;
          height: 3px;
          background: #374151;
          margin: 3px 0;
          transition: 0.3s;
          border-radius: 2px;
        }
        
        .nav-toggle.active span:nth-child(1) {
          transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .nav-toggle.active span:nth-child(2) {
          opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
          transform: rotate(45deg) translate(-5px, -6px);
        }
        
        @media (max-width: 768px) {
          .nav-toggle {
            display: flex;
          }
          
          .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background: white;
            width: 100%;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            padding: 20px;
            transition: 0.3s;
            gap: 0;
          }
          
          .nav-menu.active {
            left: 0;
          }
          
          .nav-link {
            padding: 16px;
            border-radius: 0;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .nav-link:last-child {
            border-bottom: none;
          }
          
          .linkedin-text {
            display: inline;
          }
        }
        
        @media (min-width: 769px) {
          .linkedin-text {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}