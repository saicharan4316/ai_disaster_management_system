import { useState, useEffect } from 'react';
import API from '../services/api';
import { statesList, indiaStatesAndDistricts, getLanguageForState } from '../data/indiaStatesAndDistricts';
import { 
  LayoutDashboard, ShieldAlert, Radio, Users, Terminal as TerminalIcon, 
  CheckCircle2, XCircle, Send, Plus, Trash2, Shield, Calendar, AlertTriangle, 
  MapPin, Globe2, MessageSquareCode, ArrowUpRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Backend Data States
  const [disasters, setDisasters] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Direct Broadcast Form State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastState, setBroadcastState] = useState('');
  const [broadcastDistrict, setBroadcastDistrict] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState(null);

  // Admin Add Subscriber Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubState, setNewSubState] = useState('');
  const [newSubDistrict, setNewSubDistrict] = useState('');
  const [newSubLanguage, setNewSubLanguage] = useState('');
  const [subAddSuccess, setSubAddSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [disRes, subRes, logsRes] = await Promise.all([
        API.get('/disasters/all'),
        API.get('/subscribers'),
        API.get('/alerts/logs')
      ]);
      setDisasters(disRes.data);
      setSubscribers(subRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll data every 10 seconds for real-time visual updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update language when admin adds new subscriber state
  useEffect(() => {
    if (newSubState) {
      setNewSubLanguage(getLanguageForState(newSubState).code);
    }
  }, [newSubState]);

  // Handle Approve/Verify Disaster
  const handleVerify = async (id, status) => {
    try {
      const res = await API.put(`/disasters/${id}/verify`, { status });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      console.error('Verification update failed:', err.message);
      alert('Verification update failed.');
    }
  };

  // Handle Direct Custom Broadcast
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastMsg || !broadcastState) {
      alert('Message and State are required.');
      return;
    }

    setBroadcastLoading(true);
    setBroadcastStatus(null);
    try {
      const res = await API.post('/alerts/broadcast', {
        message: broadcastMsg,
        state: broadcastState,
        district: broadcastDistrict
      });

      setBroadcastStatus({
        success: true,
        message: res.data.message,
        summary: res.data.summary
      });
      setBroadcastMsg('');
      setBroadcastState('');
      setBroadcastDistrict('');
      fetchData();
    } catch (err) {
      console.error('Direct broadcast failed:', err.message);
      setBroadcastStatus({
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch alert broadcast.'
      });
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Handle Admin Add Subscriber
  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newSubName || !newSubPhone || !newSubState || !newSubLanguage) {
      alert('Name, Phone, State, and Language are required.');
      return;
    }

    try {
      await API.post('/subscribers', {
        name: newSubName,
        phoneNumber: newSubPhone,
        state: newSubState,
        district: newSubDistrict,
        language: newSubLanguage
      });

      setSubAddSuccess(true);
      setNewSubName('');
      setNewSubPhone('');
      setNewSubState('');
      setNewSubDistrict('');
      setNewSubLanguage('');
      fetchData();

      setTimeout(() => setSubAddSuccess(false), 5000);
    } catch (err) {
      console.error('Add subscriber failed:', err.message);
      alert('Failed to register subscriber.');
    }
  };

  // Handle Delete Subscriber
  const handleDeleteSub = async (id) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      await API.delete(`/subscribers/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete subscriber failed:', err.message);
      alert('Failed to delete subscriber.');
    }
  };

  // Statistics Calculations
  const pendingReports = disasters.filter(d => d.status === 'pending_verification');
  const publishedDisasters = disasters.filter(d => d.status === 'published');
  const rejectedReports = disasters.filter(d => d.status === 'rejected');

  // Chart Data: Disasters by Severity
  const severityCounts = publishedDisasters.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, { low: 0, medium: 0, high: 0, critical: 0 });

  const chartSeverityData = Object.keys(severityCounts).map(key => ({
    name: key.toUpperCase(),
    value: severityCounts[key]
  }));

  // Chart Data: Subscribers by State
  const stateSubscriberCounts = subscribers.reduce((acc, curr) => {
    acc[curr.state] = (acc[curr.state] || 0) + 1;
    return acc;
  }, {});

  const chartSubscriberData = Object.keys(stateSubscriberCounts).map(state => ({
    state: state,
    Subscribers: stateSubscriberCounts[state]
  }));

  const SEVERITY_COLORS = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
  };

  // Target count calculator for custom broadcasts
  const targetSubscribersCount = subscribers.filter(sub => {
    if (broadcastState && sub.state !== broadcastState) return false;
    if (broadcastDistrict && sub.district !== broadcastDistrict) return false;
    return true;
  }).length;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Government Portal</h3>
            <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-purple-400" /> Administrative Hub
            </p>
          </div>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-bold cursor-pointer transition-all shrink-0 ${
                activeTab === 'overview' ? 'bg-purple-600 text-white shadow shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-bold cursor-pointer transition-all shrink-0 relative ${
                activeTab === 'pending' ? 'bg-purple-600 text-white shadow shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Pending Approvals</span>
              {pendingReports.length > 0 && (
                <span className="absolute right-2 top-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                  {pendingReports.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-bold cursor-pointer transition-all shrink-0 ${
                activeTab === 'broadcast' ? 'bg-purple-600 text-white shadow shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Radio className="h-4 w-4" />
              <span>Direct Broadcast</span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-bold cursor-pointer transition-all shrink-0 ${
                activeTab === 'subscribers' ? 'bg-purple-600 text-white shadow shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Subscriber Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-bold cursor-pointer transition-all shrink-0 ${
                activeTab === 'terminal' ? 'bg-purple-600 text-white shadow shadow-purple-900/40' : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <TerminalIcon className="h-4 w-4" />
              <span>Broadcast Terminal</span>
            </button>
          </nav>
        </div>

        <div className="hidden md:block border-t border-slate-850 pt-4 text-xxs text-slate-500">
          Logged in as Administrator. Actions encrypted & logged.
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 p-6 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Overview / Analytics tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">System Overview</h2>
                  <p className="text-xs text-slate-400">Real-time status updates of active disasters and subscriber counts.</p>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5">
                    <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">Pending Approvals</span>
                    <p className="mt-2 text-3xl font-extrabold text-amber-500">{pendingReports.length}</p>
                    <span className="mt-1 block text-xxs text-slate-500">Needs manual review</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5">
                    <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">Published Alerts</span>
                    <p className="mt-2 text-3xl font-extrabold text-emerald-400">{publishedDisasters.length}</p>
                    <span className="mt-1 block text-xxs text-slate-500">Live feeds broadcasted</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5">
                    <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">Total Subscribers</span>
                    <p className="mt-2 text-3xl font-extrabold text-purple-400">{subscribers.length}</p>
                    <span className="mt-1 block text-xxs text-slate-500">Active regional numbers</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5">
                    <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">Dispatches Logged</span>
                    <p className="mt-2 text-3xl font-extrabold text-blue-400">{logs.length}</p>
                    <span className="mt-1 block text-xxs text-slate-500">Simulations recorded</span>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Subscriber Chart */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 lg:col-span-2">
                    <h3 className="text-sm font-bold text-white mb-4">Subscriber Distribution by Region (State)</h3>
                    <div className="h-64">
                      {chartSubscriberData.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-xs text-slate-600">No subscribers registered.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartSubscriberData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="state" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            <Bar dataKey="Subscribers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Severity Pie Chart */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-white mb-4">Alert Severity Distribution</h3>
                    <div className="h-56 relative flex items-center justify-center">
                      {publishedDisasters.length === 0 ? (
                        <div className="text-xs text-slate-600">No published reports to analyze.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartSeverityData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartSeverityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#a855f7'} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    {publishedDisasters.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 text-xxs mt-2 border-t border-slate-850 pt-3">
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> LOW</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span> MEDIUM</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500"></span> HIGH</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span> CRITICAL</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pending Approvals queue */}
            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    Pending Disasters verification Queue
                  </h2>
                  <p className="text-xs text-slate-400">Validate user submitted reports. Approving triggers automatic regional translation and broadcasts.</p>
                </div>

                {pendingReports.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 py-16 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/50" />
                    <p className="mt-4 text-sm font-semibold text-slate-300">Approval Queue is Clear</p>
                    <p className="mt-1 text-xs text-slate-500">No pending reports require validation.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingReports.map((dis) => (
                      <div 
                        key={dis._id} 
                        className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col lg:flex-row justify-between gap-6 hover:border-slate-750 transition-all"
                      >
                        {/* Information Section */}
                        <div className="space-y-4 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-0.5 text-xxs font-bold uppercase text-red-400">
                              {dis.severity}
                            </span>
                            <span className="text-xxs text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(dis.reportedAt).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white">{dis.title}</h3>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{dis.description}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xxs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-purple-400" /> <strong>Location:</strong> {dis.district}, {dis.state}</div>
                            {dis.locationDetails && <div>• <strong>Specifics:</strong> {dis.locationDetails}</div>}
                            <div>• <strong>Reported By:</strong> {dis.reportedBy || 'Anonymous'}</div>
                          </div>
                        </div>

                        {/* Image Preview & Actions */}
                        <div className="flex flex-col justify-between items-start lg:items-end w-full lg:w-80 shrink-0 gap-4">
                          {/* Image preview */}
                          {dis.images && dis.images[0] ? (
                            <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                              <img src={dis.images[0]} alt="Disaster Preview" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full h-36 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-700 text-xxs font-semibold">
                              No Image Uploaded
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 w-full">
                            <button
                              onClick={() => handleVerify(dis._id, 'rejected')}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-red-950/10 hover:border-red-500/40 text-slate-400 hover:text-red-400 py-2.5 text-xs font-bold transition-all cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject Report</span>
                            </button>

                            <button
                              onClick={() => handleVerify(dis._id, 'published')}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-900/30"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Verify & Publish</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Direct Alert Broadcast Panel */}
            {activeTab === 'broadcast' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    Direct Alert Dispatcher
                  </h2>
                  <p className="text-xs text-slate-400">Broadcast official alerts to specific states and districts manually. The system automatically translates messages before delivering.</p>
                </div>

                {broadcastStatus && (
                  <div className={`rounded-lg border p-4 text-xs ${
                    broadcastStatus.success 
                      ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400' 
                      : 'border-red-500/20 bg-red-950/20 text-red-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      {broadcastStatus.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                      <div>
                        <h4 className="font-bold uppercase tracking-wider">{broadcastStatus.success ? 'Broadcast Active' : 'Dispatch Failed'}</h4>
                        <p className="mt-1 text-slate-300">{broadcastStatus.message}</p>
                        {broadcastStatus.summary && (
                          <div className="mt-2.5 space-y-1 text-xxs border-t border-slate-850 pt-2 text-slate-400">
                            <div>• Target Matches: {broadcastStatus.summary.total}</div>
                            <div>• Successfully Mocked/Delivered: {broadcastStatus.summary.success}</div>
                            {broadcastStatus.summary.logs?.length > 0 && (
                              <div className="mt-2 max-h-36 overflow-y-auto bg-slate-950 rounded p-2 font-mono text-[10px] space-y-1">
                                {broadcastStatus.summary.logs.map((log, idx) => (
                                  <div key={idx} className="border-b border-slate-900/60 pb-1">
                                    <span className="text-purple-400">To: {log.phone}</span> ({log.lang}) &rarr; <span className="text-slate-300">"{log.translated}"</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleBroadcastSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Target State */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                        Target State <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={broadcastState}
                        onChange={(e) => {
                          setBroadcastState(e.target.value);
                          setBroadcastDistrict('');
                        }}
                        className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="" disabled className="text-slate-700">Select State</option>
                        {statesList.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target District */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                        Target District (Optional)
                      </label>
                      <select
                        disabled={!broadcastState}
                        value={broadcastDistrict}
                        onChange={(e) => setBroadcastDistrict(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="" className="text-slate-500">All Districts</option>
                        {broadcastState && indiaStatesAndDistricts[broadcastState]?.map((dst) => (
                          <option key={dst} value={dst}>{dst}</option>
                        ))}
                      </select>
                    </div>

                    {/* Alert Text */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                        Alert Message (English) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        placeholder="e.g., Flood Warning: Dam water release scheduled at 3 PM. High alert in low-lying zones. Evacuate immediately."
                        className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none"
                      ></textarea>
                    </div>
                  </div>

                  {broadcastState && (
                    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4 flex justify-between items-center text-xs text-purple-400 font-medium">
                      <span>Recipient Stats:</span>
                      <span className="font-bold text-white uppercase bg-purple-900/50 px-3 py-1 rounded">
                        {targetSubscribersCount} Subscribers Target
                      </span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={broadcastLoading || !broadcastState}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 focus:outline-none active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>{broadcastLoading ? 'Dispatching Broadcast...' : 'Broadcast Alert'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Subscriber Directory tab */}
            {activeTab === 'subscribers' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    Subscriber Directory
                  </h2>
                  <p className="text-xs text-slate-400">Manage government representatives and public registers configured for localized regional language SMS dispatches.</p>
                </div>

                {/* Add Subscriber Form */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5"><Plus className="h-4.5 w-4.5 text-purple-400" /> Add New Recipient</h3>
                  
                  {subAddSuccess && (
                    <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-400">
                      Subscriber registered successfully.
                    </div>
                  )}

                  <form onSubmit={handleAddSubscriber} className="grid grid-cols-1 gap-4 md:grid-cols-5 items-end">
                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">Name</label>
                      <input
                        type="text"
                        required
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder="e.g. Ramesh K"
                        className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">Phone</label>
                      <input
                        type="tel"
                        required
                        value={newSubPhone}
                        onChange={(e) => setNewSubPhone(e.target.value)}
                        placeholder="+91 XXXXXXXXXX"
                        className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">State</label>
                      <select
                        required
                        value={newSubState}
                        onChange={(e) => {
                          setNewSubState(e.target.value);
                          setNewSubDistrict('');
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="" disabled>Select State</option>
                        {statesList.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">District</label>
                      <select
                        required
                        disabled={!newSubState}
                        value={newSubDistrict}
                        onChange={(e) => setNewSubDistrict(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="" disabled>Select</option>
                        {newSubState && indiaStatesAndDistricts[newSubState]?.map((dst) => (
                          <option key={dst} value={dst}>{dst}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-purple-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-purple-500 transition-all cursor-pointer"
                    >
                      Save Subscriber
                    </button>
                  </form>
                  {newSubState && (
                    <div className="mt-3 text-[10px] text-purple-400 font-bold">
                      Detected Language: {getLanguageForState(newSubState).label} ({newSubLanguage})
                    </div>
                  )}
                </div>

                {/* Subscribers Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-xxs">
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-6 py-3.5">Phone Number</th>
                        <th className="px-6 py-3.5">State</th>
                        <th className="px-6 py-3.5">District</th>
                        <th className="px-6 py-3.5">Language Target</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {subscribers.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{sub.name}</td>
                          <td className="px-6 py-4 font-mono text-slate-300">{sub.phoneNumber}</td>
                          <td className="px-6 py-4">{sub.state}</td>
                          <td className="px-6 py-4 text-slate-400">{sub.district || '-'}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 uppercase font-bold text-xxs text-purple-400 border border-purple-500/20 bg-purple-500/5 px-2 py-0.5 rounded-full">
                              <Globe2 className="h-3 w-3" />
                              {sub.language}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* Make sure we don't accidentally remove core seeded test numbers easily without confirmation */}
                            <button
                              onClick={() => handleDeleteSub(sub._id)}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                              title="Delete Subscriber"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {subscribers.length === 0 && (
                    <div className="text-center py-10 text-slate-600 text-xs">No registered subscribers found.</div>
                  )}
                </div>
              </div>
            )}

            {/* Broadcast Terminal Simulator tab */}
            {activeTab === 'terminal' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <TerminalIcon className="h-6 w-6 text-purple-400 animate-pulse" />
                    Live SMS Broadcast Simulator
                  </h2>
                  <p className="text-xs text-slate-400">Demonstrates translation and transmission logs. All outgoing regional notifications flow through this log feed.</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs shadow-inner min-h-[500px] flex flex-col justify-between">
                  <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2">
                    {/* Header bar */}
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between text-xxs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        SIMULATOR ACTIVE: LISTENING FOR OUTGOING BROADCASTS...
                      </span>
                      <span>FROM PHONE: +919032533828</span>
                    </div>

                    {logs.length === 0 ? (
                      <div className="text-center py-20 text-slate-700">
                        &gt;_ No broadcast events recorded yet. Trigger alerts via "Pending Approvals" or "Direct Broadcast" to populate logs.
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div 
                          key={log._id} 
                          className="border border-slate-850 bg-slate-900/25 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-purple-500/20 transition-all"
                        >
                          {/* Log Meta */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xxs border-b border-slate-850 pb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                                log.status === 'sent' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'
                              }`}>
                                {log.status}
                              </span>
                              <span className="text-purple-400 font-bold">DISPATCH &rarr; {log.recipientNumber}</span>
                            </div>
                            <span className="text-slate-500 font-sans">
                              {new Date(log.sentAt).toLocaleString()}
                            </span>
                          </div>

                          {/* Grid layout for Translation visual comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
                                Original (English)
                              </div>
                              <p className="bg-slate-950/80 p-2.5 rounded border border-slate-900 text-slate-400 text-xxs leading-relaxed italic">
                                "{log.originalText}"
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                <MessageSquareCode className="h-3.5 w-3.5 text-purple-400" />
                                AI Translation ({log.language.toUpperCase()})
                              </div>
                              <p className="bg-purple-950/10 p-2.5 rounded border border-purple-900/20 text-purple-200 font-sans leading-relaxed text-sm">
                                {log.translatedText}
                              </p>
                            </div>
                          </div>

                          {/* Error block if failed */}
                          {log.error && (
                            <div className="bg-red-950/20 border border-red-500/20 p-2 rounded text-xxs text-red-400 font-sans">
                              <strong>Error:</strong> {log.error}
                            </div>
                          )}

                          {/* Visual decorative line */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-slate-900 pt-3 text-xxs text-slate-600 flex justify-between">
                    <span>TRANSLATIONS HANDLED BY MYMEMORY TRANSLATOR API</span>
                    <span>LOG_RECORDS: {logs.length}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
