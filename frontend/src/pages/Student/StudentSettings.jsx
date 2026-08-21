import { useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { Lock, Bell, Moon, Globe, Shield, CheckCircle2, Loader2 } from "lucide-react";

const StudentSettings = () => {
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifs: true,
    testReminders: true,
    weeklyReport: true,
    language: "English",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Account & Preference Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure your notifications, security preferences, and learning alerts.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Notifications */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Notification Preferences</span>
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Email Notifications</span>
                    <span className="text-xs text-slate-500">Receive alerts when new study materials are posted.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifs}
                    onChange={(e) => setSettings({ ...settings, emailNotifs: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Test & Mock Reminders</span>
                    <span className="text-xs text-slate-500">Remind me 24 hours before a scheduled mock test.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.testReminders}
                    onChange={(e) => setSettings({ ...settings, testReminders: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Weekly AI Progress Digest</span>
                    <span className="text-xs text-slate-500">Receive a weekly summary of your band trajectory.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.weeklyReport}
                    onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Language & Regional */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Regional & Interface</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="English">English (Default)</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;
