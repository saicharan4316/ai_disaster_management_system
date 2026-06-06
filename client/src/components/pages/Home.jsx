import { useState, useEffect } from 'react';
import API from '../services/api';
import { indiaStatesAndDistricts, statesList, getLanguageForState } from '../data/indiaStatesAndDistricts';
import { ShieldAlert, AlertTriangle, MapPin, Calendar, Image as ImageIcon, Send, User, CheckCircle2, Phone, PhoneCall, Volume2 } from 'lucide-react';

export const Home = () => {
  // Feed State
  const [disasters, setDisasters] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // Report Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageB64, setImageB64] = useState('');
  const [reportingLoading, setReportingLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Subscriber Form State (SOS / Emergency Subscription)
  const [subName, setSubName] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subState, setSubState] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [subLanguage, setSubLanguage] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);

  // Fetch published alerts
  const fetchFeed = async () => {
    try {
      const res = await API.get('/disasters');
      setDisasters(res.data);
    } catch (err) {
      console.error('Error fetching disaster feed:', err.message);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    // Poll feed every 15 seconds to keep it live
    const interval = setInterval(fetchFeed, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update district dropdown when state changes
  useEffect(() => {
    setDistrict('');
  }, [state]);

  // Update language when subscription state changes
  useEffect(() => {
    if (subState) {
      const mapping = getLanguageForState(subState);
      setSubLanguage(mapping.code);
    }
  }, [subState]);

  // Handle Image upload to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageB64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !state || !district) {
      alert('Please fill out all required fields.');
      return;
    }

    setReportingLoading(true);
    try {
      await API.post('/disasters', {
        title,
        description,
        severity,
        state,
        district,
        locationDetails,
        images: imageB64 ? [imageB64] : []
      });

      setReportSuccess(true);
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setState('');
      setDistrict('');
      setLocationDetails('');
      setImagePreview(null);
      setImageB64('');
      
      // Hide success message after 5 seconds
      setTimeout(() => setReportSuccess(false), 6000);
    } catch (err) {
      console.error('Failed to report disaster:', err.message);
      alert('Failed to submit disaster report. Please try again.');
    } finally {
      setReportingLoading(false);
    }
  };

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!subName || !subPhone || !subState || !subLanguage) {
      alert('Please fill out Name, Phone, State and Language.');
      return;
    }

    setSubLoading(true);
    try {
      await API.post('/subscribers', {
        name: subName,
        phoneNumber: subPhone,
        state: subState,
        district: subDistrict,
        language: subLanguage
      });

      setSubSuccess(true);
      setSubName('');
      setSubPhone('');
      setSubState('');
      setSubDistrict('');
      setSubLanguage('');

      setTimeout(() => setSubSuccess(false), 6000);
    } catch (err) {
      console.error('Failed to register subscriber:', err.message);
      alert('Subscription failed. Please check details.');
    } finally {
      setSubLoading(false);
    }
  };

  const getSeverityStyles = (sev) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center shadow-xl sm:p-12 mb-12">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.12),rgba(0,0,0,0))]"></div>
        <div className="relative z-10 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-400">
            <span className="h-2 w-2 animate-ping rounded-full bg-red-400"></span>
            Suraksha Emergency Network
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            National Disaster Alert Portal
          </h1>
          <p className="mt-4 max-w-2xl text-slate-400">
            Empowering citizens and authorities with AI-enabled translation, real-time localized SMS notifications, and crowdsourced emergency verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Feed & Forms */}
        <div className="lg:col-span-2 space-y-12">
          {/* Active Emergency Feed */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500 animate-bounce" />
                Active Verified Alerts
              </h2>
              <span className="text-xs text-slate-500">Auto-refreshing every 15s</span>
            </div>

            {feedLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : disasters.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-850 bg-slate-900/20 py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/70" />
                <p className="mt-4 text-sm font-semibold text-slate-300">All Systems Normal</p>
                <p className="mt-1 text-xs text-slate-500">No active disasters or hazards are currently published for this region.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {disasters.map((dis) => (
                  <article 
                    key={dis._id} 
                    className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-slate-900/60 transition-all duration-300 shadow-md hover:shadow-purple-900/10"
                  >
                    <div>
                      {/* Badge / Date */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xxs font-bold uppercase ${getSeverityStyles(dis.severity)}`}>
                          {dis.severity}
                        </span>
                        <span className="text-xxs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(dis.reportedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Image */}
                      {dis.images && dis.images[0] && (
                        <div className="mt-4 overflow-hidden rounded-xl h-44 bg-slate-950 border border-slate-800">
                          <img 
                            src={dis.images[0]} 
                            alt={dis.title} 
                            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Title / Desc */}
                      <h3 className="mt-4 text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {dis.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400 line-clamp-3">
                        {dis.description}
                      </p>
                    </div>

                    {/* Footer region */}
                    <div className="mt-6 flex items-center gap-1.5 text-xxs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850/60">
                      <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <span className="font-semibold text-slate-300">{dis.district}, {dis.state}</span>
                      {dis.locationDetails && (
                        <>
                          <span className="text-slate-700">•</span>
                          <span className="truncate italic text-slate-500">{dis.locationDetails}</span>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Report Disaster Form */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-500 animate-pulse" />
              Report Incident
            </h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Crowdsource hazard data. Reports are routed to government administrators for instant translation and regional SMS broadcast.
            </p>

            {reportSuccess && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-950/25 p-4 text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Report Filed Successfully</h4>
                  <p className="mt-1 text-xs text-slate-300">
                    Your emergency alert has been sent to the government dashboard. Verified cases will translate and push to public subscribers immediately.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Disaster Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Severe Landslide, Flood Alert, Chemical Spill"
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="" disabled className="text-slate-700">Select India State</option>
                    {statesList.map((st) => (
                      <option key={st} value={st} className="text-white bg-slate-950">{st}</option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={!state}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <option value="" disabled className="text-slate-700">Select District</option>
                    {state && indiaStatesAndDistricts[state]?.map((dst) => (
                      <option key={dst} value={dst} className="text-white bg-slate-950">{dst}</option>
                    ))}
                  </select>
                </div>

                {/* Exact Location Details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Exact Location Details / Landmark
                  </label>
                  <input
                    type="text"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    placeholder="e.g., Near Pillar 45, NH-44 Highway"
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Severity Level */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="low">Low (Alert)</option>
                    <option value="medium">Medium (Warning)</option>
                    <option value="high">High (Severe Danger)</option>
                    <option value="critical">Critical (Immediate Evacuation)</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Disaster Details & Instructions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the current hazard, roads blocked, casualties, and emergency advice..."
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  ></textarea>
                </div>

                {/* Optional Image */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Incident Pictures (Optional)
                  </label>
                  <div className="mt-1 flex items-center gap-6">
                    <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-semibold text-slate-300 hover:border-purple-500/50 hover:text-white cursor-pointer transition-colors">
                      <ImageIcon className="h-4 w-4 text-purple-400" />
                      <span>Select Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-slate-800">
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageB64('');
                          }}
                          className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] hover:bg-red-500 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={reportingLoading}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:from-red-500 hover:to-purple-500 focus:outline-none active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{reportingLoading ? 'Filing Alert...' : 'Submit Emergency Request'}</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right 1 Col: SOS & Alerts Subscription Registration */}
        <div className="space-y-8">
          {/* Pulsing SOS Warning Card */}
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/20 to-slate-950 p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-red-600/10 blur-xl"></div>
            
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600/15 border border-red-500/30 animate-pulse">
              <PhoneCall className="h-7 w-7 text-red-500" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-white">Emergency Assistance</h3>
            <p className="mt-2 text-xs text-slate-400">
              Immediate threat to life or property? Please dial central emergency lines immediately.
            </p>
            
            <div className="mt-6 space-y-2.5">
              <a href="tel:112" className="flex items-center justify-between rounded-lg bg-red-650/40 border border-red-500/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors">
                <span>National Emergency</span>
                <span className="font-mono bg-red-600 px-2 py-0.5 rounded text-xs">112</span>
              </a>
              <a href="tel:108" className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:border-slate-700 transition-colors">
                <span>Disaster Management</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">108</span>
              </a>
            </div>
          </div>

          {/* SMS Broadcast Registration */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-purple-400" />
              Subscribe to Local SMS
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Receive live disaster notifications on your phone translated automatically to your state's regional language.
            </p>

            {subSuccess && (
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Subscribed! Regional SMS alerts active.</span>
              </div>
            )}

            <form onSubmit={handleSubscribeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Your Name"
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">
                    State
                  </label>
                  <select
                    required
                    value={subState}
                    onChange={(e) => setSubState(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="" disabled className="text-slate-700">Select State</option>
                    {statesList.map((st) => (
                      <option key={st} value={st} className="text-white bg-slate-950">{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400">
                    District
                  </label>
                  <select
                    required
                    disabled={!subState}
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="" disabled className="text-slate-700">Select</option>
                    {subState && indiaStatesAndDistricts[subState]?.map((dst) => (
                      <option key={dst} value={dst} className="text-white bg-slate-950">{dst}</option>
                    ))}
                  </select>
                </div>
              </div>

              {subState && (
                <div className="rounded-md bg-slate-950 border border-slate-850 p-2.5 text-xxs text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3 text-purple-400" /> Language:
                  </span>
                  <span className="font-bold text-slate-200 uppercase">{subLanguage} ({getLanguageForState(subState).label})</span>
                </div>
              )}

              <button
                type="submit"
                disabled={subLoading}
                className="w-full rounded-lg bg-purple-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-purple-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {subLoading ? 'Activating...' : 'Activate SMS Alerts'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Home;
