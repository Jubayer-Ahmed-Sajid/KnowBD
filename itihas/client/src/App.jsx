import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function HomePage() {
  return (
    <div className="section-padding min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-7xl font-heading text-heritage-green animate-fade-in-up">
        ইতিহাস
      </h1>
      <p className="mt-4 text-xl md:text-2xl text-heritage-dark/70 font-body animate-fade-in-up max-w-2xl">
        Discover the rich cultural heritage of Bangladesh — from ancient archaeological
        ruins to vibrant folk traditions.
      </p>
      <p className="mt-2 text-lg text-heritage-gold font-bengali bn animate-fade-in-up">
        বাংলাদেশের ঐতিহ্য অন্বেষণ করুন
      </p>
      <a
        href="/api/health"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-8 animate-fade-in-up"
      >
        Check API Health
      </a>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Helmet>
        <title>itihas – Bangladesh Heritage Explorer</title>
        <meta
          name="description"
          content="Explore the rich cultural heritage of Bangladesh — archaeological sites, folk traditions, and more."
        />
      </Helmet>

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Add more routes here */}
      </Routes>
    </>
  );
}
