import { useState } from "react";
import { Earth, PlusCircle } from "lucide-react";
import Modal from "../components/Modal";
import DashboardCard from "../components/DashboardCard";

export default function Land() {
  const [lands, setLands] = useState([
    { id: 1, name: "Green Valley Farm", size: "50 acres", regions: 3 },
    { id: 2, name: "Sunset Orchards", size: "30 acres", regions: 2 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLand, setNewLand] = useState({ name: "", size: "", regions: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLand({ ...newLand, [e.target.name]: e.target.value });
  };

  const handleAddLand = () => {
    setLands([...lands, { ...newLand, id: lands.length + 1 }]);
    setNewLand({ name: "", size: "", regions: 0 });
    setIsModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Lands</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-green-600 transition-all duration-300 ml-auto"
          >
            <PlusCircle className="h-6 w-6" /> Add Land
          </button>
        </div>

        {/* Land Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lands.map((land) => (
           <DashboardCard icon={Earth} key={land.id} title={land.name}>
           <p className="text-gray-400">Size: {land.size}</p>
           <p className="text-gray-400">Regions: {land.regions}</p>
         </DashboardCard>
          ))}
        </div>
      </div>

      {/* Add Land Modal */}
      {isModalOpen && (
        <Modal isOpen = {isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold text-white mb-4">Add New Land</h2>
          <input
            type="text"
            name="name"
            value={newLand.name}
            onChange={handleChange}
            placeholder="Land Name"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-2"
          />
          <input
            type="text"
            name="size"
            value={newLand.size}
            onChange={handleChange}
            placeholder="Size (e.g., 50 hectares)"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-2"
          />
          <input
            type="number"
            name="regions"
            value={newLand.regions}
            onChange={handleChange}
            min="1"
            placeholder="Number of Regions"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-4"
          />
          <button onClick={handleAddLand} className="bg-green-500 text-white px-4 py-2 rounded-lg w-full hover:bg-green-600">
            Add Land
          </button>
        </Modal>
      )}
    </div>
  );
}
