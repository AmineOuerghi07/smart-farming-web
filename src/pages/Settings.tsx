import { useState } from "react";
import { Lock, User, Edit, Save, CheckSquare } from "lucide-react";

export default function Settings() {
  const [userSettings, setUserSettings] = useState({
    name: "John Thompson",
    email: "JohnThompson@example.com",
    phone: "123-456-7890",
    address: "123 Green Lane, Farmville",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [notifications, setNotifications] = useState({ email: true, sms: false });

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setNotifications((prev) => ({ ...prev, [name]: checked }));
    } else if (name in passwords) {
      setPasswords((prev) => ({ ...prev, [name]: value }));
    } else {
      setUserSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 flex justify-center">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <img className="h-24 w-24 rounded-full mb-3" src="images/profile_image.jpg" alt="Profile" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-green-500">Manage your account and preferences</p>
        </div>

        {/* Account Details */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-green-400 text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" /> Account Details
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-green-400 flex items-center gap-1 hover:text-green-300"
            >
              <Edit className="h-4 w-4" /> {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(userSettings).map(([key, value]) => (
              <div key={key} className="p-3 rounded bg-gray-700 text-gray-300">
                {isEditing ? (
                  <input
                    type="text"
                    name={key}
                    value={value}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 border-none text-white focus:outline-none"
                  />
                ) : (
                  <span>{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-green-400 text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </h2>
            <button
              onClick={() => setIsEditingPassword(!isEditingPassword)}
              className="text-green-400 flex items-center gap-1 hover:text-green-300"
            >
              <Edit className="h-4 w-4" /> {isEditingPassword ? "Cancel" : "Edit"}
            </button>
          </div>
          {isEditingPassword && (
            <div className="space-y-3">
              <input type="password" name="oldPassword" value={passwords.oldPassword} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" placeholder="Old Password" />
              <input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" placeholder="New Password" />
              <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" placeholder="Confirm New Password" />
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="mb-6">
          <h2 className="text-green-400 text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5" /> Notification Preferences
          </h2>
          <div className="space-y-2 mt-3">
            <label className="flex items-center gap-2 text-gray-200">
              <input type="checkbox" name="email" checked={notifications.email} onChange={handleChange} className="h-5 w-5 text-green-500" />
              Email Notifications
            </label>
            <label className="flex items-center gap-2 text-gray-200">
              <input type="checkbox" name="sms" checked={notifications.sms} onChange={handleChange} className="h-5 w-5 text-green-500" />
              SMS Notifications
            </label>
          </div>
        </div>

        {/* Save Changes Button */}
        {(isEditing || isEditingPassword) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setIsEditingPassword(false);
              }}
              className="bg-green-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
            >
              <Save className="h-5 w-5" /> Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
