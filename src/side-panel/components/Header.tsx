import React from 'react';
import logo from '../assets/icons/eclipse_logo.svg';
import type { HeaderProps } from '../../types/hooks';

const Header: React.FC<HeaderProps> = ({ hasStartedChat }) => {
  return (
    <header className="sidebar-header">
      <div className="header-content">
        {hasStartedChat && (
          <img 
            src={logo} 
            alt="Eclipse Logo" 
            className="header-logo"
          />
        )}
        <h1>eclipse</h1>
      </div>
    </header>
  );
};

export default Header;
