import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaMoneyBillWave, FaHeadset, FaShieldAlt, FaClock, FaChevronLeft, FaChevronRight, FaPause, FaPlay, FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useProductCache } from '../hooks/useProductCache';
import Newsletter from '../components/Newsletter';
import WeeklyOffers from '../components/WeeklyOffers';
import SocialShare from '../components/SocialShare';
import API_URL from '../config/api';
import './Home.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

// Add this mapping for category images at the top of the file (after imports, before Home function)
const categoryImages = {
  'Foodstuffs': require('../images/shop1.jpg'),
  'Household': require('../images/shop2.jpg'),
  'Beverages': require('../images/shop3.jpg'),
  'Electronics': require('../images/shop4.jpg'),
  'Construction Materials': require('../images/shop5.jpg'),
  'Plastics': require('../images/shop6.jpg'),
  'Cosmetics': require('../images/shop1.jpg'),
  'Powder Detergent': require('../images/shop2.jpg'),
  'Liquid Detergent': require('../images/shop3.jpg'),
  'Juices': require('../images/shop4.jpg'),
  'Dental Care': require('../images/shop5.jpg'),
  'Beef': require('../images/shop6.jpg'),
};

// Shop images (replace with your actual uploaded paths if needed)
const shopImages = [
  require('../images/shop1.jpg'), // Place your first shop image in src/assets/shop1.jpg
  require('../images/shop2.jpg'), // Place your second shop image in src/assets/shop2.jpg
];

function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { getProductsByCategory } = useProductCache();
  const [latestProducts, setLatestProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersIndex, setBestSellersIndex] = useState(0);
  const [testimonialsIndex, setTestimonialsIndex] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Helper function to safely get product name
  const getProductName = (product) => {
    if (typeof product.name === 'string') {
      // Old structure - name is a string
      return product.name;
    } else if (product.name && typeof product.name === 'object') {
      // New structure - name is an object with pt/en
      return product.name[i18n.language] || product.name.en || product.name.pt || '';
    }
    return '';
  };

  // Helper function to safely get announcement title
  const getAnnouncementTitle = (announcement) => {
    if (typeof announcement.title === 'string') {
      return announcement.title;
    } else if (announcement.title && typeof announcement.title === 'object') {
      return announcement.title[i18n.language] || announcement.title.en || announcement.title.pt || '';
    }
    return '';
  };

  // Helper function to safely get announcement content
  const getAnnouncementContent = (announcement) => {
    if (typeof announcement.content === 'string') {
      return announcement.content;
    } else if (announcement.content && typeof announcement.content === 'object') {
      return announcement.content[i18n.language] || announcement.content.en || announcement.content.pt || '';
    }
    return '';
  };

  // Helper function to translate announcement category
  const getAnnouncementCategory = (category) => {
    const categoryKey = category.toLowerCase().replace(' ', '');
    return t(`announcementForm.categories.${categoryKey}`, category);
  };

  // Helper function to translate category names
  const getTranslatedCategory = (category) => {
    // Map category names to their translation keys
    const categoryMap = {
      'Foodstuffs': 'foodstuffs',
      'Household': 'household',
      'Beverages': 'beverages',
      'Electronics': 'electronics',
      'Construction Materials': 'constructionMaterials',
      'Plastics': 'plastics',
      'Cosmetics': 'cosmetics',
      'Powder Detergent': 'powderDetergent',
      'Liquid Detergent': 'liquidDetergent',
      'Juices': 'juices',
      'Dental Care': 'dentalCare',
      'Beef': 'beef'
    };
    
    const categoryKey = categoryMap[category] || category.toLowerCase().replace(/\s+/g, '');
    return t(`products.${categoryKey}`, category);
  };

  // Helper function to safely get product description
  const getProductDescription = (product) => {
    if (typeof product.description === 'string') {
      // Old structure - description is a string
      return product.description;
    } else if (product.description && typeof product.description === 'object') {
      // New structure - description is an object with pt/en
      return product.description[i18n.language] || product.description.en || product.description.pt || '';
    }
    return '';
  };

  const heroSlides = [
    {
      image: shopImages[0], // First shop image
      title: t('home.shop'),
      description: t('home.shop'),
      buttonText: t('home.shopBtn'),
      buttonLink: '/products',
      position: 'center'
    },
    {
      image: categoryImages['Foodstuffs'],
      title: t('home.foodstuffsTitle'),
      description: t('home.foodstuffsDesc'),
      buttonText: t('home.foodstuffsBtn'),
      buttonLink: '/products?category=Foodstuffs',
      position: 'left'
    },
    {
      image: categoryImages['Household'],
      title: t('home.householdTitle'),
      description: t('home.householdDesc'),
      buttonText: t('home.householdBtn'),
      buttonLink: '/products?category=Household',
      position: 'right'
    },
    {
      image: categoryImages['Beverages'],
      title: t('home.beveragesTitle'),
      description: t('home.beveragesDesc'),
      buttonText: t('home.beveragesBtn'),
      buttonLink: '/products?category=Beverages',
      position: 'center'
    },
    {
      image: categoryImages['Electronics'],
      title: t('home.electronicsTitle'),
      description: t('home.electronicsDesc'),
      buttonText: t('home.electronicsBtn'),
      buttonLink: '/products?category=Electronics',
      position: 'left'
    },
    {
      image: categoryImages['Construction Materials'],
      title: t('home.constructionTitle'),
      description: t('home.constructionDesc'),
      buttonText: t('home.constructionBtn'),
      buttonLink: '/products?category=Construction Materials',
      position: 'right'
    },
    {
      image: categoryImages['Plastics'],
      title: t('home.plasticsTitle'),
      description: t('home.plasticsDesc'),
      buttonText: t('home.plasticsBtn'),
      buttonLink: '/products?category=Plastics',
      position: 'center'
    },
    {
      image: categoryImages['Cosmetics'],
      title: t('home.cosmeticsTitle'),
      description: t('home.cosmeticsDesc'),
      buttonText: t('home.cosmeticsBtn'),
      buttonLink: '/products?category=Cosmetics',
      position: 'left'
    },
    {
      image: categoryImages['Powder Detergent'],
      title: t('home.powderDetergentTitle'),
      description: t('home.powderDetergentDesc'),
      buttonText: t('home.powderDetergentBtn'),
      buttonLink: '/products?category=Powder Detergent',
      position: 'right'
    },
    {
      image: categoryImages['Liquid Detergent'],
      title: t('home.liquidDetergentTitle'),
      description: t('home.liquidDetergentDesc'),
      buttonText: t('home.liquidDetergentBtn'),
      buttonLink: '/products?category=Liquid Detergent',
      position: 'center'
    },
    {
      image: categoryImages['Juices'],
      title: t('home.juicesTitle'),
      description: t('home.juicesDesc'),
      buttonText: t('home.juicesBtn'),
      buttonLink: '/products?category=Juices',
      position: 'left'
    },
    {
      image: categoryImages['Dental Care'],
      title: t('home.dentalCareTitle'),
      description: t('home.dentalCareDesc'),
      buttonText: t('home.dentalCareBtn'),
      buttonLink: '/products?category=Dental Care',
      position: 'right'
    },
    {
      image: categoryImages['Beef'],
      title: t('home.beefTitle'),
      description: t('home.beefDesc'),
      buttonText: t('home.beefBtn'),
      buttonLink: '/products?category=Beef',
      position: 'center'
    }
  ];

  useEffect(() => {
    // Restore scroll position if returning from announcement detail or products
    const savedPosition = window.sessionStorage.getItem('scrollPosition');
    const returnToSection = window.sessionStorage.getItem('returnToSection');
    
    if (savedPosition) {
      if (returnToSection === 'featured-categories') {
        // Wait for the page to render
        setTimeout(() => {
          const section = document.querySelector('.featured-categories');
          if (section) {
            const yOffset = -100; // Offset to account for any fixed headers
            const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
          window.sessionStorage.removeItem('returnToSection');
        }, 100);
      } else {
        window.scrollTo(0, parseInt(savedPosition));
      }
      window.sessionStorage.removeItem('scrollPosition');
    }

    // Restore scroll position to specific announcement if returning from detail
    const savedAnnouncementId = window.sessionStorage.getItem('lastViewedAnnouncement');
    if (savedAnnouncementId) {
      // Wait for the announcements to be loaded and rendered
      setTimeout(() => {
        const element = document.getElementById(`announcement-${savedAnnouncementId}`);
        if (element) {
          const yOffset = -100; // Offset to account for any fixed headers
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
        window.sessionStorage.removeItem('lastViewedAnnouncement');
      }, 100);
    }

    const fetchData = async () => {
      try {
        const [productsResponse, bestSellersResponse, announcementsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/products/public?sort=-createdAt&limit=4`),
          axios.get(`${API_URL}/api/products/public?sort=-sales&limit=10`), // Fetch up to 10 best sellers
          axios.get(`${API_URL}/api/announcements/public`)
        ]);

        console.log('Latest Products Response:', productsResponse.data);
        console.log('Best Sellers Response:', bestSellersResponse.data);
        console.log('Announcements Response:', announcementsResponse.data);
        
        // Check if the responses contain valid data
        const latestProductsData = productsResponse.data?.products || [];
        const bestSellersData = bestSellersResponse.data?.products || [];
        const announcementsData = Array.isArray(announcementsResponse.data) ? announcementsResponse.data : [];

        if (latestProductsData.length === 0) {
          console.warn('No latest products found');
        }
        if (bestSellersData.length === 0) {
          console.warn('No best sellers found');
        }
        if (announcementsData.length === 0) {
          console.warn('No announcements found');
        }

        // Ensure we only take the top 4 best sellers
        setBestSellers(bestSellersData);
        setLatestProducts(latestProductsData);
        setAnnouncements(announcementsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.response || error);
        setLatestProducts([]);
        setBestSellers([]);
        setAnnouncements([]);
        setLoading(false);
      }
    };

    fetchData();

    // Auto-advance slider
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'Space') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, toggleAutoPlay]);

  // Handle auto-play
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, nextSlide]);

  // Modify the touch event handlers to prevent interference with links
  const handleTouchStart = (e) => {
    // Don't handle touch events if the target is a link or button
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    // Don't handle touch events if we didn't start tracking
    if (!touchStart) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    // Don't handle touch events if we didn't start tracking
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      nextSlide();
    } else {
      prevSlide();
    }

    // Reset touch coordinates
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Add click handler for category links
  const handleCategoryClick = useCallback((e, category) => {
    e.preventDefault();
    
    try {
      // Get products for this category from cache
      const categoryProducts = getProductsByCategory(category);
      console.log(`Found ${categoryProducts.length} products for category: ${category}`);
      
      // Stop auto-playing when navigating away
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }

      // Navigate to products page with category
      navigate(`/products?category=${category}`);
      
    } catch (error) {
      console.error('Error handling category click:', error);
      // Navigate anyway even if there's an error
      navigate(`/products?category=${category}`);
    }
  }, [navigate, getProductsByCategory]);

  const allCategories = [
    'Foodstuffs',
    'Household',
    'Beverages',
    'Electronics',
    'Construction Materials',
    'Plastics',
    'Cosmetics',
    'Powder Detergent',
    'Liquid Detergent',
    'Juices',
    'Dental Care',
    'Beef'
  ];

  const testimonials = [
    {
      id: 1,
      name: t('home.testimonial1.name'),
      role: t('home.testimonial1.role'),
      comment: t('home.testimonial1.comment'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 2,
      name: t('home.testimonial2.name'),
      role: t('home.testimonial2.role'),
      comment: t('home.testimonial2.comment'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 3,
      name: t('home.testimonial3.name'),
      role: t('home.testimonial3.role'),
      comment: t('home.testimonial3.comment'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80'
    }
  ];

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/announcements/public?limit=5`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchActiveOffers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/offers/public/active`);
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const [popularResponse, newResponse] = await Promise.all([
        axios.get(`${API_URL}/api/products/public?sort=popular&limit=4`),
        axios.get(`${API_URL}/api/products/public?sort=newest&limit=4`)
      ]);
      setPopularProducts(popularResponse.data.products);
      setNewProducts(newResponse.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="home">
      {/* Hero Section with Enhanced Slider */}
      <section 
        className="hero-slider"
        ref={sliderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div 
          className="slides-container" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide content-${slide.position} ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), 
                url('${slide.image}')`
              }}
              aria-hidden={index !== currentSlide}
            >
              <div className="hero-content">
                <h1 className={`slide-title ${slide.title === t('home.shop') ? 'afri-cabinda' : ''}`}>{slide.title}</h1>
                <p className="slide-description">{slide.description}</p>
                {slide.buttonLink.includes('category=') ? (
                  <button 
                    onClick={(e) => handleCategoryClick(e, slide.buttonLink.split('category=')[1])}
                    className="cta-button buy-red-btn"
                  >
                    {slide.buttonText}
                    <span className="button-arrow">→</span>
                  </button>
                ) : (
                  <Link 
                    to={slide.buttonLink} 
                    className="cta-button buy-red-btn"
                  >
                    {slide.buttonText}
                    <span className="button-arrow">→</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="slider-controls">
          <button 
            className="slider-button prev" 
            onClick={prevSlide} 
            aria-label="Previous slide"
          >
            <FaChevronLeft />
          </button>
          <button 
            className="slider-button next" 
            onClick={nextSlide} 
            aria-label="Next slide"
          >
            <FaChevronRight />
          </button>
          <button 
            className="slider-button play-pause" 
            onClick={toggleAutoPlay}
            aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>

        <div className="slider-navigation">
          <div className="slider-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>
          <div className="slide-counter">
            {currentSlide + 1} / {heroSlides.length}
          </div>
        </div>

        <div className="slide-progress">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${((currentSlide + 1) / heroSlides.length) * 100}%`,
              transition: 'width 0.5s ease-in-out' 
            }} 
          />
        </div>
      </section>

      {/* Social Share Section */}
      <section className="social-share-section">
        <h3 className="social-share-title">
          {t('home.shareWithFriends')}
        </h3>
        <SocialShare 
          showWhatsApp={true}
          showFacebook={true}
          showTwitter={true}
          showLinkedIn={false}
          showTelegram={false}
        />
      </section>

      {/* Announcements Section */}
      <section className="announcements">
        <div className="container">
          <h2>{t('home.latestUpdates')}</h2>
          {loading && (
            <div className="loading-overlay">
              <LoadingSpinner 
                size="large" 
                color="primary" 
                variant="circle"
                text={t('home.loadingAnnouncements')}
                showText={true}
              />
            </div>
          )}
          {announcements.length === 0 ? (
            <div>{t('home.noAnnouncements')}</div>
          ) : (
            <div className="announcements-grid">
              {announcements.map(announcement => (
                <div 
                  key={announcement._id} 
                  id={`announcement-${announcement._id}`}
                  className={`announcement-card ${announcement.category.toLowerCase().replace(' ', '-')}`}
                >
                  {announcement.imageUrl && (
                    <img 
                      src={announcement.imageUrl} 
                      alt="" 
                      className="announcement-image"
                      onError={(e) => {
                        console.error('Failed to load image:', announcement.imageUrl);
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  )}
                  <div className="announcement-content">
                    <span className="announcement-type">{getAnnouncementCategory(announcement.category)}</span>
                    <h3>
                      {getAnnouncementTitle(announcement).length > 70 
                        ? `${getAnnouncementTitle(announcement).substring(0, 70)}...` 
                        : getAnnouncementTitle(announcement)}
                    </h3>
                    <p>
                      {getAnnouncementContent(announcement).length > 200 
                        ? `${getAnnouncementContent(announcement).substring(0, 200)}... ` 
                        : getAnnouncementContent(announcement)}
                      {getAnnouncementContent(announcement).length > 200 && (
                        <Link 
                          to={`/announcement/${announcement._id}`} 
                          className="read-more"
                          onClick={() => {
                            window.sessionStorage.setItem('lastViewedAnnouncement', announcement._id);
                          }}
                        >
                          {t('home.readMore')}
                        </Link>
                      )}
                    </p>
                    <div className="announcement-date">
                      <FaClock />
                      <span>{new Date(announcement.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <h2 className='categories-header'>{t('home.featuredCategories')}</h2>
        <div className="categories-marquee">
          <div className="categories-marquee-track">
            {/* First set of categories */}
            {allCategories.map((cat, idx) => (
              <div 
                key={cat + idx} 
                className="category-marquee-item" 
                onClick={(e) => handleCategoryClick(e, cat)}
                style={{ cursor: 'pointer' }}
              >
                {getTranslatedCategory(cat)}
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {allCategories.map((cat, idx) => (
              <div 
                key={`${cat}-duplicate-${idx}`} 
                className="category-marquee-item" 
                onClick={(e) => handleCategoryClick(e, cat)}
                style={{ cursor: 'pointer' }}
              >
                {getTranslatedCategory(cat)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="best-sellers">
        <h2>{t('home.bestSellers')}</h2>
        {loading && (
          <div className="loading-overlay">
            <LoadingSpinner 
              size="large" 
              color="primary" 
              variant="ring"
              text={t('home.loadingBestSellers')}
              showText={true}
            />
          </div>
        )}
        {bestSellers.length === 0 ? (
          <div>{t('home.noBestSellers')}</div>
        ) : (
          <div className="best-sellers-swiper-wrapper">
            <button 
              className="swiper-arrow left"
              onClick={() => setBestSellersIndex(i => (i - 1 + bestSellers.length) % bestSellers.length)}
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>
            <div className="best-sellers-swiper">
              {bestSellers.map((product, idx) => {
                // Show 3 at a time (desktop), 2 (tablet), 1 (mobile)
                let visibleCount = 3;
                if (window.innerWidth <= 768) visibleCount = 2;
                if (window.innerWidth <= 480) visibleCount = 1;
                // Calculate if this product should be visible
                let start = bestSellersIndex;
                let end = (start + visibleCount) % bestSellers.length;
                let isVisible = false;
                if (end > start) {
                  isVisible = idx >= start && idx < end;
                } else {
                  isVisible = idx >= start || idx < end;
                }
                return isVisible ? (
                  <div key={product._id} className="product-card swiper-slide">
                    <div className="product-image">
                      <img 
                        src={product.imageUrl} 
                        alt={getProductName(product)}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80';
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <div className="product-header">
                        <h3>{getProductName(product)}</h3>
                        <span className="category-tag">{getTranslatedCategory(product.category)}</span>
                      </div>
                      <div className="product-description">
                        <div className="content">
                          {getProductDescription(product).length > 100
                            ? getProductDescription(product).slice(0, 100) + '...'
                            : getProductDescription(product)}
                        </div>
                      </div>
                      <div className="product-footer">
                        <a 
                          href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || '244922706107'}?text=I'm interested in ${encodeURIComponent(getProductName(product))}`} 
                          className="whatsapp-button buy-red-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaWhatsapp /> {t('common.buy')}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
            <button 
              className="swiper-arrow right"
              onClick={() => setBestSellersIndex(i => (i + 1) % bestSellers.length)}
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </section>

      {/* Weekly Offers Section */}
      <WeeklyOffers />

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <h2>{t('home.whyChooseUs')}</h2>
        <div className="features-grid">
          <div className="feature">
            <FaTruck className="feature-icon" />
            <h3>{t('home.fastDelivery')}</h3>
            <p>{t('home.fastDeliveryDesc')}</p>
          </div>
          <div className="feature">
            <FaMoneyBillWave className="feature-icon" />
            <h3>{t('home.bestPrices')}</h3>
            <p>{t('home.bestPricesDesc')}</p>
          </div>
          <div className="feature">
            <FaHeadset className="feature-icon" />
            <h3>{t('home.support')}</h3>
            <p>{t('home.supportDesc')}</p>
          </div>
          <div className="feature">
            <FaShieldAlt className="feature-icon" />
            <h3>{t('home.secureShopping')}</h3>
            <p>{t('home.secureShoppingDesc')}</p>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="latest-products">
        <h2>{t('home.latestProducts')}</h2>
        {loading && (
          <div className="loading-overlay">
            <LoadingSpinner 
              size="large" 
              color="primary" 
              variant="circle"
              text={t('home.loadingLatestProducts')}
              showText={true}
            />
          </div>
        )}
        {latestProducts.length === 0 ? (
          <div>{t('home.noProducts')}</div>
        ) : (
          <div className="latest-products-scroll-container">
            <div className="latest-products-scroll-track">
              {/* First set of products */}
              {latestProducts.slice(0, 10).map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.imageUrl} 
                      alt={getProductName(product)}
                      onError={(e) => {
                        console.error('Image failed to load:', {
                          product: getProductName(product),
                          url: product.imageUrl
                        });
                        e.target.src = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-header">
                      <h3>{getProductName(product)}</h3>
                      <span className="category-tag">{getTranslatedCategory(product.category)}</span>
                    </div>
                    <div className="product-description">
                      <div className="content">
                        {getProductDescription(product).length > 100
                          ? getProductDescription(product).slice(0, 100) + '...'
                          : getProductDescription(product)}
                      </div>
                    </div>
                    <div className="product-footer">
                      <a 
                        href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || '244922706107'}?text=I'm interested in ${encodeURIComponent(getProductName(product))}`} 
                        className="whatsapp-button buy-red-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaWhatsapp /> {t('common.buy')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {latestProducts.slice(0, 10).map(product => (
                <div key={`${product._id}-duplicate`} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.imageUrl} 
                      alt={getProductName(product)}
                      onError={(e) => {
                        console.error('Image failed to load:', {
                          product: getProductName(product),
                          url: product.imageUrl
                        });
                        e.target.src = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-header">
                      <h3>{getProductName(product)}</h3>
                      <span className="category-tag">{getTranslatedCategory(product.category)}</span>
                    </div>
                    <div className="product-description">
                      <div className="content">
                        {getProductDescription(product).length > 100
                          ? getProductDescription(product).slice(0, 100) + '...'
                          : getProductDescription(product)}
                      </div>
                    </div>
                    <div className="product-footer">
                      <a 
                        href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || '244922706107'}?text=I want to buy ${encodeURIComponent(getProductName(product))}`} 
                        className="whatsapp-button buy-red-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaWhatsapp /> {t('common.buy')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>{t('home.testimonials')}</h2>
        <div className="testimonials-swiper-wrapper">
          <button 
            className="swiper-arrow left"
            onClick={() => setTestimonialsIndex(i => (i - 1 + testimonials.length) % testimonials.length)}
            aria-label="Previous"
          >
            <FaChevronLeft />
          </button>
          <div className="testimonials-swiper">
            {testimonials.map((testimonial, idx) => {
              // Show 2 at a time (desktop), 1 (mobile)
              let visibleCount = 2;
              if (window.innerWidth <= 768) visibleCount = 1;
              // Calculate if this testimonial should be visible
              let start = testimonialsIndex;
              let end = (start + visibleCount) % testimonials.length;
              let isVisible = false;
              if (end > start) {
                isVisible = idx >= start && idx < end;
              } else {
                isVisible = idx >= start || idx < end;
              }
              return isVisible ? (
                <div key={testimonial.id} className="testimonial-card swiper-slide">
                  <img src={testimonial.avatar} alt={testimonial.name} className="avatar" />
                  <p className="comment">{testimonial.comment}</p>
                  <h4>{testimonial.name}</h4>
                  <p className="role">{testimonial.role}</p>
                </div>
              ) : null;
            })}
          </div>
          <button 
            className="swiper-arrow right"
            onClick={() => setTestimonialsIndex(i => (i + 1) % testimonials.length)}
            aria-label="Next"
          >
            <FaChevronRight />
          </button>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}

export default Home;