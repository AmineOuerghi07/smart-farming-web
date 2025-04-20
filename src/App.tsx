import { useState } from 'react';
import { Menu, ShoppingCart } from 'lucide-react';
import Drawer from './components/Drawer';
import { Outlet } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './state/store';

const App = () => {
  const ShoppingItemscount = useSelector ((state : RootState) => state.counter.value);
  const totalPrice = useSelector ((state : RootState) => state.totalPrice.value);
  const dispatch = useDispatch();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  return (

    <div className="w-full bg-gray-900 text-gray-100 ">

      <nav className="bg-green-700 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <a
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-2 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Menu size={24} color='white' />
          </a>
          <h1 className="text-xl font-semi-bold">Farm Dashboard</h1>
        </div>
        <a href='/ShoppingCart' >
          <div className="flex items-center space-x-4 hover:bg-green-800 p-2 rounded-lg transition-colors">
            <button className="p-2 relative">
              <ShoppingCart size={26} />
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{ShoppingItemscount}</span>
            </button>
            {totalPrice.toFixed(3)}DT
          </div>
        </a>
      </nav>
      <div className="flex">
        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <Outlet />
      </div>
    </div>
  )
  //return <Dashboard/>
}

export default App