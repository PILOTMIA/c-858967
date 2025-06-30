
import ClientSignup from "@/components/ClientSignup";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
          <p className="text-gray-300">Manage your account and trading preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Membership</span>
                <span className="text-yellow-400">Free Tier</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Signals Access</span>
                <span className="text-red-400">Limited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Community Access</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Upgrade Account</h2>
            <p className="text-gray-300 mb-4">Unlock premium features and signals</p>
            <ClientSignup />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Trading Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Preferred Pairs</label>
              <select className="w-full bg-gray-800 text-white p-2 rounded">
                <option>All Major Pairs</option>
                <option>EUR/USD Focus</option>
                <option>GBP/USD Focus</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Risk Level</label>
              <select className="w-full bg-gray-800 text-white p-2 rounded">
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
