import { useState } from 'react';
import { Menu } from 'lucide-react';
import Drawer from './components/Drawer';
import { Outlet } from 'react-router';

const App = () =>
{
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  return(

    <div className="w-full bg-gray-900 text-gray-100 ">

      <nav className="bg-green-700 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <a 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-2 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Menu size={24} color='white'  />
          </a>
          <h1 className="text-xl font-semi-bold">Farm Dashboard</h1>
        </div>
      </nav>
      <div className="flex">
        <Drawer  isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}  />
        <Outlet/>
    </div>
  </div>
    )
  //return <Dashboard/>
}

export default App