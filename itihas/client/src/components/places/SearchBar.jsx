import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const CATEGORIES = [
  'Archaeological', 'Architectural', 'Religious', 'Natural',
  'Liberation War', 'Cultural', 'UNESCO',
];

const DIVISIONS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
];

export default function SearchBar({ onSearch, initialValues = {} }) {
  const [keyword, setKeyword] = useState(initialValues.keyword || '');
  const [category, setCategory] = useState(initialValues.category || '');
  const [division, setDivision] = useState(initialValues.division || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({ keyword, category, division });
  };

  const handleReset = () => {
    setKeyword('');
    setCategory('');
    setDivision('');
    onSearch?.({ keyword: '', category: '', division: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-heritage-cream p-4 flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-heritage-dark/40 text-sm" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search heritage sites..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-heritage-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-green/30 focus:border-heritage-green bg-heritage-cream/40"
        />
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="py-2.5 px-3 text-sm border border-heritage-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-green/30 focus:border-heritage-green bg-heritage-cream/40 text-heritage-dark"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        value={division}
        onChange={(e) => setDivision(e.target.value)}
        className="py-2.5 px-3 text-sm border border-heritage-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-green/30 focus:border-heritage-green bg-heritage-cream/40 text-heritage-dark"
      >
        <option value="">All Divisions</option>
        {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary py-2.5 px-5 text-sm gap-2">
          <FaSearch className="inline" /> Search
        </button>
        {(keyword || category || division) && (
          <button type="button" onClick={handleReset} className="py-2.5 px-4 text-sm text-heritage-dark/60 hover:text-heritage-dark border border-heritage-cream rounded-lg transition-colors">
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
