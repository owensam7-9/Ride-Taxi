import React, { useState } from 'react';
import MenuBar from './menubar';

const Header: React.FC = () => {
  const [networkError, setNetworkError] = useState(false);

  React.useEffect(() => {
    const checkNetwork = async () => {
      try {
        const online = await fetch("https://jsonplaceholder.typicode.com/todos/1");
        setNetworkError(online.status !== 200);
      } catch (error) {
        console.log(error);
        setNetworkError(true);
      }
    };

    const interval = setInterval(checkNetwork, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {networkError && (
        <div className="fixed top-5 left-5 bg-red-500 text-white rounded-lg py-4 px-3 z-50 flex justify-between w-[250px]">
          <p className="text-[16px]">Unable to reach network</p>
          <button
            onClick={() => setNetworkError(false)}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
      <MenuBar />
    </div>
  );
};

export default Header;