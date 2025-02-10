
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface MetricRowProps {
    icon: IconComponent;
    label: string;
    value: string | number;
    iconColor?: string;
  }

const MetricRow: React.FC<MetricRowProps> = ({ icon: Icon, label, value, iconColor = "text-gray-400" }) => 
    {
        return(
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className={iconColor} />
      <span>{label}</span>
    </div>
    <span>{value}</span>
  </div>
);
    }

    export default MetricRow