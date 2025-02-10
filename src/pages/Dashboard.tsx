import { useState } from "react";
import { Activity, User, CheckSquare, Leaf, Calendar, Cloud, Clock, AlertTriangle, Check, Tractor, Sun, Wind } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import MetricRow from "../components/MetricRow";
import StatusMessage from "../components/StatusMessage";


// Weather Card Component
const WeatherCard: React.FC = () => (
    <DashboardCard title="Weather Conditions" icon={Cloud}>
      <MetricRow icon={Sun} label="Temperature" value="75°F" iconColor="text-yellow-400" />
      <MetricRow icon={Cloud} label="Humidity" value="45%" iconColor="text-blue-400" />
      <MetricRow icon={Wind} label="Wind Speed" value="8 mph NW" iconColor="text-gray-400" />
      <StatusMessage message="Ideal conditions for harvesting" />
    </DashboardCard>
  );
  
  // Equipment Card Component
  const EquipmentCard: React.FC = () => (
    <DashboardCard title="Equipment Status" icon={Tractor}>
      <MetricRow icon={Check} label="Active Tractors" value="3/5" iconColor="text-green-400" />
      <MetricRow icon={Clock} label="Hours Today" value="12.5 hrs" iconColor="text-yellow-400" />
      <MetricRow icon={AlertTriangle} label="Maintenance Due" value="2 vehicles" iconColor="text-red-400" />
      <StatusMessage message="Scheduled maintenance: Tractor #2 tomorrow" color="text-yellow-400" />
    </DashboardCard>
  );
  
  // Crop Card Component
  const CropCard: React.FC = () => (
    <DashboardCard title="Crop Status" icon={Leaf}>
      <MetricRow icon={Leaf} label="Active Fields" value="12/15" iconColor="text-green-400" />
      <MetricRow icon={Calendar} label="Next Harvest" value="3 days" iconColor="text-blue-400" />
      <MetricRow icon={Cloud} label="Irrigation" value="Active (2/12)" iconColor="text-blue-400" />
      <StatusMessage message="Wheat fields ready for harvest next week" />
    </DashboardCard>
  );

export default function DashboardPage() {
  const [metrics] = useState([
    { label: "Total Users", value: "1,200", icon: User },
    { label: "Active Sessions", value: "230", icon: Activity },
    { label: "System Health", value: "Operational", icon: CheckSquare },
  ]);

  return (
    <div className="w-full min-h-screen bg-gray-900 p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-green-500">Overview of system activity and performance</p>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <DashboardCard key={metric.label} title={metric.label} icon={metric.icon}>
              <MetricRow icon={metric.icon} label={metric.label} value={metric.value} />
            </DashboardCard>
          ))}
        </div>

       
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <WeatherCard />
              <EquipmentCard />
              <CropCard />
            </div>
       

        {/* Recent Activity Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Recent Activity</h2>
          <StatusMessage message="User JohnDoe logged in." />
          <StatusMessage message="System update applied successfully." />
          <StatusMessage message="New user registered: JaneSmith." />
        </div>
      </div>
    </div>
  );
}
