import { 
  Droplet,
  Thermometer,
  Activity,
  Sun,
  Wind,
  Warehouse,
  Tractor,
  Timer,
  Shovel
} from 'lucide-react';


const Profile = () => {
  const farmerData = {
    name: "John Thompson",
    yearsExperience: 25,
    totalLand: 850,
    activeParcels: 4,
    activeSensors: 24,
    equipmentCount: 12,
    farmingOperations: [
      { 
        name: "Field Operations",
        status: "In Progress",
        details: "Soil preparation for winter wheat",
        equipment: "Tractor + Plow",
        duration: "3 days remaining"
      },
      { 
        name: "Irrigation Maintenance",
        status: "Scheduled",
        details: "Center pivot inspection",
        equipment: "Maintenance Kit",
        duration: "Starts in 2 days"
      },
      { 
        name: "Harvest Planning",
        status: "Active",
        details: "Corn yield estimation",
        equipment: "Yield Monitor",
        duration: "5 days remaining"
      },
      { 
        name: "Storage Management",
        status: "Ongoing",
        details: "Grain silo monitoring",
        equipment: "Temperature sensors",
        duration: "Continuous"
      }
    ]
  };

  const sensorData = [
    { type: "Soil Moisture", value: "85%", change: "+5%", icon: Droplet, detail: "Optimal range" },
    { type: "Temperature", value: "24°C", change: "-2°C", icon: Thermometer, detail: "Ground level" },
    { type: "Humidity", value: "65%", change: "+3%", icon: Wind, detail: "Field average" },
    { type: "Sunlight", value: "850 w/m²", change: "Peak", icon: Sun, detail: "Clear sky" }
  ];

  const equipmentMetrics = [
    { title: "Active Equipment", value: "8/12", icon: Tractor, detail: "4 in maintenance" },
    { title: "Storage Capacity", value: "75%", icon: Warehouse, detail: "3 silos active" },
    { title: "Field Operations", value: "3", icon: Shovel, detail: "2 scheduled" },
    { title: "Operation Hours", value: "2,450", icon: Timer, detail: "This season" }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-900 p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 flex items-center gap-4">
              <img className='h-24 w-24 rounded-full flex items-center justify-center' src='images/profile_image.jpg'/>

          <div>
            <h1 className="text-3xl font-bold text-white">{farmerData.name}</h1>
            <p className="text-green-500">
              {farmerData.yearsExperience} Years of Farming Experience
            </p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {equipmentMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.title} className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-green-400 text-lg font-semibold">
                    {metric.title}
                  </h3>
                  <Icon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {metric.value}
                  </p>
                  <p className="text-green-500 text-sm">
                    {metric.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Operations Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg mb-8">
          <div className="mb-6">
            <h2 className="text-green-400 text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Current Operations
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farmerData.farmingOperations.map((op) => (
              <div 
                key={op.name}
                className="p-4 rounded-lg bg-gray-700 border border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-green-400">{op.name}</h3>
                  <span className="px-2 py-1 rounded-full text-sm bg-green-900 text-green-400">
                    {op.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-1">{op.details}</p>
                <p className="text-gray-400 text-sm">Equipment: {op.equipment}</p>
                <p className="text-green-500 text-sm mt-2">{op.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sensor Readings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
          <div className="mb-6">
            <h2 className="text-green-400 text-xl font-semibold">Live Sensor Readings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sensorData.map((sensor) => {
              const Icon = sensor.icon;
              return (
                <div 
                  key={sensor.type}
                  className="flex items-center gap-3 p-4 rounded-lg bg-gray-700 border border-gray-600"
                >
                  <Icon className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-green-400">{sensor.type}</p>
                    <p className="text-xl font-semibold text-white">
                      {sensor.value}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400">{sensor.detail}</span>
                      <span className="text-sm text-green-400">{sensor.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;