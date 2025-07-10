import { useState, useEffect, useRef } from 'react';
import './App.css';

const INDUSTRIES = [
  'Fintech',
  'Edtech',
  'SaaS',
  'AI',
  'Automotive',
  'E-commerce',
  'Fashion',
  'Media',
  'Biotech',
  'Healthcare',
  'Consumer',
  'Mobility',
  'Other',
];

// Canonical investment range buckets
const RANGE_BUCKETS = [
  '<$500K',
  '$500K-$2M',
  '$2M-$10M',
  '$10M+',
];
function getRangeBucket(range) {
  if (!range) return '<$500K';
  const min = parseInt(range.replace(/[^\d]/g, ''));
  if (range.includes('M')) {
    if (min < 500) return '<$500K';
    if (min < 2000) return '$500K-$2M';
    if (min < 10000) return '$2M-$10M';
    return '$10M+';
  }
  if (min < 500000) return '<$500K';
  if (min < 2000000) return '$500K-$2M';
  if (min < 10000000) return '$2M-$10M';
  return '$10M+';
}

function App() {
  const [industry, setIndustry] = useState('Fintech');
  const [customIndustry, setCustomIndustry] = useState('');
  const [vcs, setVcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loggedIn, setLoggedIn] = useState(true); // Simulate login
  const [page, setPage] = useState('main'); // 'main', 'shortlist', 'recently'

  // Filter UI state
  const [stageFilters, setStageFilters] = useState([]);
  const [countryFilters, setCountryFilters] = useState([]);
  const [rangeFilters, setRangeFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // For mobile filter drawer
  const [modalVC, setModalVC] = useState(null); // For VC details modal
  const [recentlyViewed, setRecentlyViewed] = useState([]); // For recently viewed VCs
  const [notes, setNotes] = useState(() => {
    // Load notes from localStorage
    try {
      return JSON.parse(localStorage.getItem('vcNotes') || '{}');
    } catch {
      return {};
    }
  });

  // Save notes to localStorage when changed
  useEffect(() => {
    localStorage.setItem('vcNotes', JSON.stringify(notes));
  }, [notes]);

  // Add to recently viewed when modal is opened
  useEffect(() => {
    if (modalVC) {
      setRecentlyViewed((prev) => {
        const exists = prev.find((v) => v.id === modalVC.id);
        if (exists) {
          // Move to front
          return [modalVC, ...prev.filter((v) => v.id !== modalVC.id)].slice(0, 5);
        }
        return [modalVC, ...prev].slice(0, 5);
      });
    }
  }, [modalVC]);

  // Move these outside of vcs-dependent logic so they're always available
  const ALL_STAGE_OPTIONS = [
    'Pre-Seed', 'Seed', 'Pre-Series A', 'Series A', 'Series B', 'Growth', 'Late'
  ];
  const ALL_COUNTRY_OPTIONS = ['India', 'Global'];
  const MAIN_SECTORS = [
    'Fintech', 'Edtech', 'SaaS', 'AI', 'Automotive', 'E-commerce', 'Fashion', 'Media', 'Biotech', 'Healthcare', 'Consumer', 'Mobility'
  ];

  const clearFilters = () => {
    setStageFilters([]);
    setCountryFilters([]);
    setRangeFilters([]);
  };

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      const favs = localStorage.getItem('favorites');
      if (favs) setFavorites(JSON.parse(favs));
    }
  }, [loggedIn]);

  const toggleFavorite = (vc) => {
    if (!loggedIn) return;
    let updated;
    if (favorites.some(f => f.id === vc.id)) {
      updated = favorites.filter(f => f.id !== vc.id);
    } else {
      updated = [...favorites, vc];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVcs([]);
    try {
      const res = await fetch('/firms.json');
      if (!res.ok) throw new Error('Failed to fetch VC data');
      const data = await res.json();
      let filtered;
      if (industry === 'Other' && industryInput) {
        filtered = data.filter((vc) =>
          (vc.verticals || []).some((v) => v.toLowerCase().includes(industryInput.toLowerCase()))
        );
      } else if (industry === 'Other') {
        filtered = data.filter((vc) =>
          !(vc.verticals || []).some((v) => MAIN_SECTORS.some((s) => v.toLowerCase() === s.toLowerCase()))
        );
      } else {
        filtered = data.filter((vc) =>
          (vc.verticals || []).some((v) => v.toLowerCase().includes(industry.toLowerCase()))
        );
      }
      setVcs(filtered);
      if (filtered.length === 0) setError('No VCs found for this industry.');
    } catch (err) {
      setError('Error fetching VC data. Please try again later.');
    }
    setLoading(false);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper: get all unique stages, countries, and ranges from vcs
  const allRanges = Array.from(new Set(vcs.map(vc => vc.investment_range)));

  // Filtering logic
  const filteredVCs = vcs.filter(vc => {
    const stageMatch = stageFilters.length === 0 || stageFilters.some(f => (vc.stage || '').includes(f));
    const country = (vc.location || '').includes('India') ? 'India' : 'Global';
    const countryMatch = countryFilters.length === 0 || countryFilters.includes(country);
    const bucket = getRangeBucket(vc.investment_range);
    const rangeMatch = rangeFilters.length === 0 || rangeFilters.includes(bucket);
    return stageMatch && countryMatch && rangeMatch;
  });

  // VC card click handler
  const handleCardClick = (vc) => setModalVC(vc);

  // Notes logic
  const handleNoteChange = (vcId, value) => {
    setNotes((prev) => ({ ...prev, [vcId]: value }));
  };

  const [industryInput, setIndustryInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allVerticals, setAllVerticals] = useState([]);
  const inputRef = useRef();

  // Fetch all verticals for autosuggest on mount
  useEffect(() => {
    fetch('/firms.json')
      .then(res => res.json())
      .then(data => {
        const verticals = Array.from(new Set(data.flatMap(vc => vc.verticals || [])));
        setAllVerticals(verticals);
      });
  }, []);

  // Autosuggest logic
  useEffect(() => {
    if (industry === 'Other' && industryInput) {
      const startsWith = allVerticals.filter(v => v.toLowerCase().startsWith(industryInput.toLowerCase()));
      const includes = allVerticals.filter(v => !v.toLowerCase().startsWith(industryInput.toLowerCase()) && v.toLowerCase().includes(industryInput.toLowerCase()));
      setSuggestions([...startsWith, ...includes]);
    } else {
      setSuggestions([]);
    }
  }, [industryInput, industry, allVerticals]);

  return (
    <div className={`main-bg${darkMode ? ' dark' : ''}`}>
      <header className={`header sticky${darkMode ? ' dark' : ''}`}>
        <span className="logo">Invesho</span>
        <span className="subtitle">Find the right VC for your startup</span>
        <div className="header-actions">
          <button
            className={`recently-toggle`}
            onClick={() => setPage(page === 'recently' ? 'main' : 'recently')}
          >
            {page === 'recently' ? 'Back to Search' : `Recently Viewed (${recentlyViewed.length})`}
          </button>
          <button className="shortlist-toggle" onClick={() => setPage(page === 'shortlist' ? 'main' : 'shortlist')}>
            {page === 'shortlist' ? 'Back to Search' : `Shortlist (${favorites.length})`}
          </button>
          <button
            className={`dark-toggle${darkMode ? ' active' : ''}`}
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>
      <div className="app-layout">
        {/* Sidebar filter menu, only on main page */}
        {page === 'main' && (
          <>
            {/* Mobile filter button */}
            <button className="mobile-filters-btn" onClick={() => setShowFilters(true)}>
              ☰ Filters
            </button>
            {/* Desktop sidebar */}
            <aside className="sidebar desktop-sidebar">
              <div className="sticky-filters">
                <div className="sidebar-title">Filters</div>
                <div className="sidebar-section">
                  <div className="sidebar-label">Stage</div>
                  {ALL_STAGE_OPTIONS.map(stage => (
                    <label key={stage} className="sidebar-tag">
                      <input type="checkbox" checked={stageFilters.includes(stage)} onChange={() => setStageFilters(f => f.includes(stage) ? f.filter(s => s !== stage) : [...f, stage])} />
                      {stage}
                    </label>
                  ))}
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-label">Country</div>
                  {ALL_COUNTRY_OPTIONS.map(country => (
                    <label key={country} className="sidebar-tag">
                      <input type="checkbox" checked={countryFilters.includes(country)} onChange={() => setCountryFilters(f => f.includes(country) ? f.filter(c => c !== country) : [...f, country])} />
                      {country}
                    </label>
                  ))}
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-label">Investment Range</div>
                  {RANGE_BUCKETS.map(range => (
                    <label key={range} className="sidebar-tag">
                      <input type="checkbox" checked={rangeFilters.includes(range)} onChange={() => setRangeFilters(f => f.includes(range) ? f.filter(r => r !== range) : [...f, range])} />
                      {range}
                    </label>
                  ))}
                </div>
              </div>
            </aside>
            {/* Mobile filter drawer */}
            {showFilters && (
              <div className="filter-drawer-overlay" onClick={() => setShowFilters(false)}>
                <div className="filter-drawer" onClick={e => e.stopPropagation()}>
                  <button className="close-drawer-btn" onClick={() => setShowFilters(false)}>&times;</button>
                  <div className="sticky-filters">
                    <div className="sidebar-title">Filters</div>
                    <div className="sidebar-section">
                      <div className="sidebar-label">Stage</div>
                      {ALL_STAGE_OPTIONS.map(stage => (
                        <label key={stage} className="sidebar-tag">
                          <input type="checkbox" checked={stageFilters.includes(stage)} onChange={() => setStageFilters(f => f.includes(stage) ? f.filter(s => s !== stage) : [...f, stage])} />
                          {stage}
                        </label>
                      ))}
                    </div>
                    <div className="sidebar-section">
                      <div className="sidebar-label">Country</div>
                      {ALL_COUNTRY_OPTIONS.map(country => (
                        <label key={country} className="sidebar-tag">
                          <input type="checkbox" checked={countryFilters.includes(country)} onChange={() => setCountryFilters(f => f.includes(country) ? f.filter(c => c !== country) : [...f, country])} />
                          {country}
                        </label>
                      ))}
                    </div>
                    <div className="sidebar-section">
                      <div className="sidebar-label">Investment Range</div>
                      {RANGE_BUCKETS.map(range => (
                        <label key={range} className="sidebar-tag">
                          <input type="checkbox" checked={rangeFilters.includes(range)} onChange={() => setRangeFilters(f => f.includes(range) ? f.filter(r => r !== range) : [...f, range])} />
                          {range}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <main className="main-content">
          {page === 'main' && (
            <div className="container">
              <h1>Find VCs by Industry</h1>
              <form onSubmit={handleSearch} className="industry-form">
                <select
                  value={industry}
                  onChange={(e) => {
                    setIndustry(e.target.value);
                    if (e.target.value !== 'Other') setIndustryInput('');
                  }}
                  className="industry-select"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                {industry === 'Other' && (
                  <div className="custom-industry-autosuggest">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search or enter industry..."
                      value={industryInput}
                      onChange={e => setIndustryInput(e.target.value)}
                      className="custom-industry-input"
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                      <ul className="suggestions-list">
                        {suggestions.map((s, idx) => (
                          <li key={s+idx} onClick={() => {
                            setIndustryInput(s);
                            setSuggestions([]);
                          }}>
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Find VCs'}
                </button>
              </form>
              {/* Results summary and active filters */}
              <div className="results-summary">
                <p><strong>{filteredVCs.length}</strong> VCs found</p>
                <p>
                  Filters:
                  <span> Industry - {industry || 'Any'}</span>
                  {stageFilters.length > 0 && <span>, Stage - {stageFilters.join(', ')}</span>}
                  {countryFilters.length > 0 && <span>, Country - {countryFilters.join(', ')}</span>}
                  {rangeFilters.length > 0 && <span>, Investment - {rangeFilters.join(', ')}</span>}
                </p>
                {(stageFilters.length > 0 || countryFilters.length > 0 || rangeFilters.length > 0) && (
                  <button className="reset-filters-btn" onClick={clearFilters}>Reset Filters</button>
                )}
              </div>
              {loading && <div className="spinner"></div>}
              {error && <p className="error">{error}</p>}
              {/* Remove any recently viewed section from the main page. Only show on 'recently' page. */}
              <div className="vc-list">
                {filteredVCs.map((vc, idx) => (
                  <div className="vc-card" key={vc.id || idx} onClick={() => handleCardClick(vc)} style={{cursor:'pointer'}}>
                    <h2>{vc.name}</h2>
                    {loggedIn && (
                      <button className="star-btn" onClick={e => {e.stopPropagation(); toggleFavorite(vc);}} title="Save to shortlist" tabIndex={0}>
                        {favorites.some(f => f.id === vc.id) ? '★' : '☆'}
                        <span className="star-tooltip">{favorites.some(f => f.id === vc.id) ? 'Remove from shortlist' : 'Save to shortlist'}</span>
                      </button>
                    )}
                    <p><strong>Location:</strong> {vc.location}</p>
                    <p><strong>Industries:</strong> {(vc.verticals || []).join(', ')}</p>
                    <p><strong>Investment Range:</strong> {vc.investment_range}</p>
                    <p><strong>Stage:</strong> {vc.stage}</p>
                    <p><strong>Email:</strong> {vc.email ? <a href={`mailto:${vc.email}`}>{vc.email}</a> : <span style={{color:'#888'}}>Not available</span>}</p>
                    {vc.website && <p><strong>Website:</strong> <a href={vc.website} target="_blank" rel="noopener noreferrer">{vc.website}</a></p>}
                    {vc.notable_investments && (
                      <p><strong>Notable Investments:</strong> {vc.notable_investments.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'shortlist' && (
            <div className="container">
              <h1>My Shortlisted VCs</h1>
              {favorites.length === 0 ? (
                <p>No VCs shortlisted yet.</p>
              ) : (
                <div className="vc-list">
                  {favorites.map((vc, idx) => (
                    <div className="vc-card" key={vc.id || idx}>
                      <h2>{vc.name}</h2>
                      <button className="star-btn" onClick={() => toggleFavorite(vc)} title="Remove from shortlist">
                        ⭐
                        <span className="star-tooltip">Remove from shortlist</span>
                      </button>
                      <p><strong>Location:</strong> {vc.location}</p>
                      <p><strong>Industries:</strong> {(vc.verticals || []).join(', ')}</p>
                      <p><strong>Investment Range:</strong> {vc.investment_range}</p>
                      <p><strong>Stage:</strong> {vc.stage}</p>
                      <p><strong>Email:</strong> {vc.email ? <a href={`mailto:${vc.email}`}>{vc.email}</a> : <span style={{color:'#888'}}>Not available</span>}</p>
                      {vc.website && <p><strong>Website:</strong> <a href={vc.website} target="_blank" rel="noopener noreferrer">{vc.website}</a></p>}
                      {vc.notable_investments && (
                        <p><strong>Notable Investments:</strong> {vc.notable_investments.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {page === 'recently' && (
            <div className="container">
              <h1>Recently Viewed VCs</h1>
              {recentlyViewed.length === 0 ? (
                <p>No VCs viewed yet.</p>
              ) : (
                <div className="vc-list">
                  {recentlyViewed.map((vc, idx) => (
                    <div className="vc-card mini" key={vc.id || idx} onClick={() => handleCardClick(vc)}>
                      <h2>{vc.name}</h2>
                      <p><strong>Location:</strong> {vc.location}</p>
                      <p><strong>Industries:</strong> {(vc.verticals || []).join(', ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <footer className={`footer${darkMode ? ' dark' : ''}`}>
        Made By Sayak Mukherjee
      </footer>
      {showScroll && (
        <button className="scroll-top" onClick={handleScrollTop} aria-label="Scroll to top">
          ⬆️
        </button>
      )}
      {/* VC Details Modal */}
      {modalVC && (
        <div className="modal-overlay" onClick={() => setModalVC(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setModalVC(null)}>&times;</button>
            <h2>{modalVC.name}</h2>
            <p><strong>Location:</strong> {modalVC.location}</p>
            <p><strong>Industries:</strong> {(modalVC.verticals || []).join(', ')}</p>
            <p><strong>Investment Range:</strong> {modalVC.investment_range}</p>
            <p><strong>Stage:</strong> {modalVC.stage}</p>
            <p><strong>Email:</strong> {modalVC.email ? <a href={`mailto:${modalVC.email}`}>{modalVC.email}</a> : <span style={{color:'#888'}}>Not available</span>}</p>
            {modalVC.website && <p><strong>Website:</strong> <a href={modalVC.website} target="_blank" rel="noopener noreferrer">{modalVC.website}</a></p>}
            {modalVC.notable_investments && (
              <p><strong>Notable Investments:</strong> {modalVC.notable_investments.join(', ')}</p>
            )}
            {favorites.some(f => f.id === modalVC.id) && (
              <div className="notes-section">
                <label htmlFor="vc-note">Your Note:</label>
                <textarea
                  id="vc-note"
                  value={notes[modalVC.id] || ''}
                  onChange={e => handleNoteChange(modalVC.id, e.target.value)}
                  placeholder="Add a private note about this VC..."
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      )}
      </div>
  );
}

export default App;
