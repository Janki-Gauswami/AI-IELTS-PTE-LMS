import { useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { Shield, Bell, Database, CheckCircle2, Loader2, Save, Server } from "lucide-react";

const AdminSettings = () => {
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    instituteName: "FlyHigh IELTS & PTE Coaching",
    adminEmail: "admin@flyhigh.com",
    allowSelfRegistration: false,
    autoEvaluateObjective: true,
    enableAIBandPrediction: true,
    sessionTimeoutMinutes: 120,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institute & Platform Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure institute global preferences, AI service models, evaluation rules, and system access.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Institute settings saved successfully!</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* General Info */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <span>General Institute Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    value={settings.instituteName}
                    onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* AI & Automation Rules */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>AI & Automation Controls</span>
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Automatic Objective Scoring
                    </span>
                    <span className="text-xs text-slate-500">
                      Auto-score Listening and Reading multiple choice questions upon submission.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoEvaluateObjective}
                    onChange={(e) =>
                      setSettings({ ...settings, autoEvaluateObjective: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Enable AI Band Prediction & Study Planner
                    </span>
                    <span className="text-xs text-slate-500">
                      Generate real-time projected scores and adaptive weekly schedules for students.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAIBandPrediction}
                    onChange={(e) =>
                      setSettings({ ...settings, enableAIBandPrediction: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Institute Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
