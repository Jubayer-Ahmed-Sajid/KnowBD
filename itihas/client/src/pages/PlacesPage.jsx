import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { placesAPI } from '../services/api';
import PlaceCard from '../components/places/PlaceCard';
import SearchBar from '../components/places/SearchBar';

const CATEGORIES = ['Archaeological', 'Architectural', 'Religious', 'Natural', 'Liberation War', 'Cultural', 'UNESCO'];
const ERAS = ['Ancient (pre-1200)', 'Sultanate (1200-1576)', 'Mughal (1576-1757)', 'Colonial (1757-1947)', 'Liberation War (1971)', 'Modern Bangladesh'];
const DIVISIONS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: '-heritageScore', label: 'Heritage Score' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: '-createdAt', label: 'Newest' },
  { value: 'name.en', label: 'A–Z' },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-heritage-cream" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-heritage-cream rounded w-1/3" />
        <div className="h-5 bg-heritage-cream rounded w-4/5" />
        <div className="h-3 bg-heritage-cream rounded w-2/3" />
      </div>
    </div>
  );
}

export default function PlacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  const category = searchParams.get('category') || '';
  const division = searchParams.get('division') || '';
  const keyword = searchParams.get('keyword') || '';
  const sort = searchParams.get('sort') || 'featured';
  const era = searchParams.get('era') || '';

  const fetchPlaces = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await placesAPI.getAll({ ...params, limit });
      setPlaces(data?.data || []);
      setTotal(data?.total || 0);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = { page, sort };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (division) params.division = division;
    if (era) params.era = era;
    fetchPlaces(params);
  }, [page, keyword, category, division, era, sort, fetchPlaces]);

  const handleSearch = ({ keyword: kw, category: cat, division: div }) => {
    setPage(1);
    const next = new URLSearchParams();
    if (kw) next.set('keyword', kw);
    if (cat) next.set('category', cat);
    if (div) next.set('division', div);
    if (sort !== 'featured') next.set('sort', sort);
    setSearchParams(next);
  };

  const setFilter = (key, value) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Helmet>
        <title>Heritage Places – ইতিহাস</title>
      </Helmet>

      <div className="min-h-screen bg-heritage-cream">
        {/* Header */}
        <div className="bg-heritage-green text-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-heading font-bold mb-2">Heritage Places</h1>
            <p className="text-white/70">Explore {total > 0 ? total : ''} remarkable sites across Bangladesh</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <SearchBar
            onSearch={handleSearch}
            initialValues={{ keyword, category, division }}
          />

          {/* Filters row */}
          <div className="mt-6 flex flex-wrap gap-2 items-center">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="py-1.5 px-3 text-sm border border-heritage-cream rounded-lg bg-white text-heritage-dark focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div className="h-5 w-px bg-heritage-cream mx-1" />

            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter('category', category === c ? '' : c)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    category === c
                      ? 'bg-heritage-green text-white border-heritage-green'
                      : 'bg-white text-heritage-dark border-heritage-cream hover:border-heritage-green hover:text-heritage-green'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Era filter */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ERAS.map((e) => (
              <button
                key={e}
                onClick={() => setFilter('era', era === e ? '' : e)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  era === e
                    ? 'bg-heritage-gold text-white border-heritage-gold'
                    : 'bg-white text-heritage-dark border-heritage-cream hover:border-heritage-gold hover:text-heritage-gold'
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Active filters summary */}
          {(keyword || category || division || era) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-heritage-dark/60">
              <span>Filters:</span>
              {[keyword && `"${keyword}"`, category, division, era].filter(Boolean).map((f) => (
                <span key={f} className="bg-heritage-green/10 text-heritage-green px-2 py-0.5 rounded-full text-xs">{f}</span>
              ))}
              <button onClick={() => { setSearchParams(new URLSearchParams()); setPage(1); }} className="text-xs text-heritage-dark/40 hover:text-heritage-dark underline">
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-heritage-dark/40 text-lg">No heritage sites found.</p>
                <button onClick={() => { setSearchParams(new URLSearchParams()); setPage(1); }} className="mt-4 btn-primary text-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {places.map((place) => <PlaceCard key={place._id} place={place} />)}
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg border border-heritage-cream bg-white disabled:opacity-40 hover:border-heritage-green transition-colors"
              >
                Previous
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                      page === p
                        ? 'bg-heritage-green text-white border-heritage-green'
                        : 'bg-white border-heritage-cream hover:border-heritage-green'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-heritage-cream bg-white disabled:opacity-40 hover:border-heritage-green transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
