// src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Shield, Bell, Users, FileText } from 'lucide-react';
import { chamaSettingsAPI } from '../services/api';

export default function Settings() {
  const {} = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    chama_name: 'Mama Chama',
    description: "A women's savings and investment group focused on financial empowerment",
    monthly_contribution: 5000,
    late_penalty: 500,
    loan_interest_rate: 10,
    max_loan_duration: 12,
    meeting_day: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await chamaSettingsAPI.get();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await chamaSettingsAPI.update(settings);
      // Show success message
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'chama', label: 'Chama Rules', icon: Users },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm">Manage your chama preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Chama Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chama Name</label>
                  <input 
                    type="text" 
                    value={settings.chama_name || ''} 
                    onChange={(e) => setSettings({...settings, chama_name: e.target.value})}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={settings.description || ''}
                    onChange={(e) => setSettings({...settings, description: e.target.value})}
                    className="input-field min-h-[80px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Contribution</label>
                    <input 
                      type="number" 
                      value={settings.monthly_contribution || 0} 
                      onChange={(e) => setSettings({...settings, monthly_contribution: Number(e.target.value)})}
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Late Penalty</label>
                    <input 
                      type="number" 
                      value={settings.late_penalty || 0} 
                      onChange={(e) => setSettings({...settings, late_penalty: Number(e.target.value)})}
                      className="input-field" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Interest Rate (%)</label>
                    <input 
                      type="number" 
                      value={settings.loan_interest_rate || 0} 
                      onChange={(e) => setSettings({...settings, loan_interest_rate: Number(e.target.value)})}
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Loan Duration (months)</label>
                    <input 
                      type="number" 
                      value={settings.max_loan_duration || 0} 
                      onChange={(e) => setSettings({...settings, max_loan_duration: Number(e.target.value)})}
                      className="input-field" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'Contribution Reminders', desc: 'Get reminded before contribution deadline' },
                  { label: 'Loan Updates', desc: 'Notifications about loan applications and approvals' },
                  { label: 'Meeting Reminders', desc: 'Reminders before scheduled meetings' },
                  { label: 'Merry-Go-Round Updates', desc: 'Notifications about payout schedule' },
                  { label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <button className="btn-primary flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chama' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Chama Constitution Rules</h3>
              <div className="space-y-4">
                {[
                  { rule: '1. Monthly contributions are due by the 5th of each month' },
                  { rule: '2. Late contributions attract a penalty of KES 500' },
                  { rule: '3. Loans are available up to 3x the member\'s total contribution' },
                  { rule: '4. Loan interest rate is 10% flat rate' },
                  { rule: '5. Every loan requires at least 2 guarantors' },
                  { rule: '6. Maximum loan repayment period is 12 months' },
                  { rule: '7. Monthly meetings are mandatory; a fine of KES 200 for absence' },
                  { rule: '8. Merry-go-round follows alphabetical order by default' },
                  { rule: '9. A member must have contributed for 3 months before applying for a loan' },
                  { rule: '10. Changes to the constitution require 2/3 majority vote' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700">{item.rule}</p>
                  </div>
                ))}
                <button className="btn-secondary flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Download Constitution
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}