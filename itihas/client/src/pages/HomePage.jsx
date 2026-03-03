import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  FaLandmark, FaMosque, FaTree, FaFlag, FaMusic,
  FaMapMarkerAlt, FaArrowRight, FaChevronRight,
} from 'react-icons/fa';
import { GiAncientColumns, GiCastle } from 'react-icons/gi';
import { MdStars } from 'react-icons/md';
import { placesAPI } from '../services/api';
import PlaceCard from '../components/places/PlaceCard';

const CATEGORIES = [
  { name: 'Archaeological', icon: GiAncientColumns, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Architectural', icon: GiCastle, color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Religious', icon: FaMosque, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Natural', icon: FaTree, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { name: 'Liberation War', icon: FaFlag, color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Cultural', icon: FaMusic, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'UNESCO', icon: MdStars, color: 'bg-blue-50 text-blue-700 border-blue-200' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function StatsSection({ stats }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <section ref={ref} className="bg-heritage-green text-white py-16">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { label: 'Heritage Sites', value: stats?.totalPlaces || 150, suffix: '+' },
          { label: 'Categories', value: stats?.totalCategories || 7 },
          { label: 'Historical Eras', value: stats?.totalEras || 12 },
          { label: 'Divisions', value: 8 },
        ].map(({ label, value, suffix = '' }) => (
          <div key={label}>
            <div className="text-4xl md:text-5xl font-heading font-bold text-heritage-gold">
              {inView ? <CountUp end={value} duration={2.5} suffix={suffix} /> : '0'}
            </div>
            <div className="mt-2 text-sm text-white/70 font-medium">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    placesAPI.getFeatured().then(({ data }) => setFeatured(data?.data || [])).catch(() => {}).finally(() => setLoadingFeatured(false));
    placesAPI.getStats().then(({ data }) => setStats(data?.data || data)).catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>ইতিহাস – Bangladesh Heritage Explorer</title>
        <meta name="description" content="Discover the rich cultural heritage of Bangladesh." />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-heritage-dark overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1597838816882-4435b1977fbe?w=1600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-heritage-dark/60 via-transparent to-heritage-dark" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.p variants={fadeUp} className="text-heritage-gold text-sm font-medium uppercase tracking-[0.3em] mb-4">
              বাংলাদেশের ঐতিহ্য অন্বেষণ করুন
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-7xl md:text-9xl font-bengali font-bold text-white leading-none mb-4">
              ইতিহাস
            </motion.h1>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-heading text-heritage-cream/90 font-light mb-6">
              Bangladesh Heritage Explorer
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-heritage-cream/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Journey through centuries of history, culture, and tradition. Discover archaeological
              wonders, architectural marvels, and living cultural heritage across Bangladesh.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Link to="/places" className="btn-gold text-base py-3.5 px-8 gap-2">
                Explore Heritage <FaArrowRight className="inline ml-1" />
              </Link>
              <Link to="/map" className="inline-flex items-center gap-2 text-base py-3.5 px-8 rounded-lg border-2 border-white/30 text-white hover:bg-white/10 transition-colors">
                <FaMapMarkerAlt /> View Map
              </Link>
            </motion.div>
          </motion.div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* Stats */}
      <StatsSection stats={stats} />

      {/* Featured Places */}
      <section className="section-padding bg-heritage-cream">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <span className="text-heritage-gold text-sm font-medium uppercase tracking-widest">Curated Selection</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-heritage-dark mt-2">Featured Heritage Sites</h2>
            <p className="mt-3 text-heritage-dark/60 max-w-xl mx-auto">
              Handpicked gems that showcase the breadth of Bangladesh's cultural legacy.
            </p>
          </motion.div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              className="pb-12"
            >
              {featured.map((place) => (
                <SwiperSlide key={place._id}>
                  <PlaceCard place={place} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-center text-heritage-dark/50">No featured places available.</p>
          )}

          <div className="text-center mt-8">
            <Link to="/places" className="btn-primary gap-2">
              View All Places <FaChevronRight className="inline ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <span className="text-heritage-gold text-sm font-medium uppercase tracking-widest">Browse By</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-heritage-dark mt-2">Heritage Categories</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {CATEGORIES.map(({ name, icon: Icon, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={`/places?category=${encodeURIComponent(name)}`}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${color}`}
                >
                  <Icon size={32} />
                  <span className="text-xs font-semibold text-center leading-tight">{name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="section-padding bg-heritage-dark text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-heritage-gold text-sm font-medium uppercase tracking-widest">About ইতিহাস</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-5">
              Preserving Bangladesh's Cultural Legacy
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              ইতিহাস is a comprehensive digital platform dedicated to documenting, preserving, and
              promoting the rich cultural heritage of Bangladesh. From the ruins of Mahasthangarh to
              the Sundarbans mangrove forests, we bring these treasures to life.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Our community of explorers, historians, and storytellers contribute reviews, stories,
              and photographs to create the most complete guide to Bangladeshi heritage.
            </p>
            <div className="flex gap-4">
              <Link to="/places" className="btn-gold">Start Exploring</Link>
              <Link to="/register" className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
                Join Community
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { title: 'Discover', desc: 'Find heritage sites across 8 divisions with our interactive map.' },
              { title: 'Learn', desc: 'Read detailed histories, timelines, and cultural significance.' },
              { title: 'Share', desc: 'Contribute your own stories and experiences with the community.' },
              { title: 'Preserve', desc: 'Help document and protect cultural heritage for future generations.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-heading font-semibold text-heritage-gold mb-2">{title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
