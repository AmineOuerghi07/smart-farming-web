import React from "react";

interface StatusMessageProps {
    message: string;
    color?: string;
  }
// Status Message Component
const StatusMessage: React.FC<StatusMessageProps> = ({ message, color = "text-green-400" }) =>
    { return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <p className={color}>{message}</p>
    </div>
  );
}

export default StatusMessage