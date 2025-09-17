import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  link: string;
}

const services: ServiceItem[] = [
  {
    id: 'rides',
    name: 'Rides',
    description: 'Book a ride to your destination',
    icon: '🚗',
    link: '/'
  },
  {
    id: 'delivery',
    name: 'Delivery',
    description: 'Send packages across town',
    icon: '📦',
    link: '/delivery'
  },
  {
    id: 'driver',
    name: 'Drive',
    description: 'Sign up to drive with us',
    icon: '👨',
    link: '/driver/register'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Transportation solutions for businesses',
    icon: '💼',
    link: '/business'
  }
];

interface NavMenuProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const NavMenu: React.FC<NavMenuProps> = ({ onClose, isMobile = false }) => {
  return (
    <div className={`${
      isMobile ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : ''
    }`}>
      <div className={`
        ${isMobile 
          ? 'fixed right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out'
          : 'relative bg-transparent'
        }
      `}>
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
        
        <nav className={`
          ${isMobile ? 'pt-16 px-4' : 'flex items-center space-x-6'}
        `}>
          <div className={`
            grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-4 gap-6'}
          `}>
            {services.map((service) => (
              <Link
                key={service.id}
                to={service.link}
                onClick={onClose}
                className={`
                  group p-4 rounded-lg transition-all duration-300
                  ${isMobile 
                    ? 'hover:bg-gray-100'
                    : 'hover:bg-white hover:shadow-lg'
                  }
                `}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavMenu;