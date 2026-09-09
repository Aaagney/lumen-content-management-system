import { ShieldCheck, Save, Check } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [siteName, setSiteName] = useState('Admin CMS');
  const [siteDescription, setSiteDescription] = useState('Content Management Platform');
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [autoApprove, setAutoApprove] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <Check size={16} /> Settings saved successfully.
        </div>
      )}

      {/* General Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">General Settings</h3>
        <p className="mt-1 text-sm text-slate-500">Configure your platform's basic information.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Site Description</label>
            <input
              type="text"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Admin Email</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">Content Settings</h3>
        <p className="mt-1 text-sm text-slate-500">Control how content is reviewed and published.</p>

        <div className="mt-5 space-y-4">
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Auto-approve content</p>
              <p className="mt-0.5 text-sm text-slate-500">Skip the pending review step for new content.</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoApprove(!autoApprove)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                autoApprove ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  autoApprove ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Email notifications</p>
              <p className="mt-0.5 text-sm text-slate-500">Receive emails when content is submitted.</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                emailNotifications ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Admin Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Administrator Role</p>
            <p className="mt-0.5 text-sm text-slate-500">
              You have full access to manage content, categories, and platform settings.
              Authentication integration is ready for future implementation.
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  );
}
