import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaMoneyBillWave, FaHeadset, FaShieldAlt, FaClock, FaChevronLeft, FaChevronRight, FaPause, FaPlay, FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useProductCache } from '../hooks/useProductCache';
import Newsletter from '../components/Newsletter';
import WeeklyOffers from '../components/WeeklyOffers';
import API_URL from '../config/api';
import './Home.css';
import LoadingSpinner from '../components/LoadingSpinner';

function Home() {
  const navigate = useNavigate();
  const { getProductsByCategory } = useProductCache();
  const [latestProducts, setLatestProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
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

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&h=1080&q=80',
      title: 'Welcome to Our Retail Store',
      description: 'Discover a wide selection of quality products at competitive prices',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      position: 'center'
    },
    {
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1920&h=1080&q=80',
      title: 'Traditional Foodstuffs',
      description: 'Explore our selection of authentic Angolan foodstuffs',
      buttonText: 'View Foodstuffs',
      buttonLink: '/products?category=Foodstuffs',
      position: 'right'
    },
    {
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1920&h=1080&q=80',
      title: 'Refreshing Drinks',
      description: 'Traditional and modern beverages for every taste',
      buttonText: 'View Drinks',
      buttonLink: '/products?category=Drinks',
      position: 'left'
    },
    {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&h=1080&q=80',
      title: 'Fashion Collection',
      description: 'Stay stylish with our latest fashion items',
      buttonText: 'Shop Fashion',
      buttonLink: '/products?category=Fashion',
      position: 'right'
    },
    {
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1920&h=1080&q=80',
      title: 'Home & Living',
      description: 'Transform your living space with our premium collection',
      buttonText: 'Explore Home',
      buttonLink: '/products?category=Home%20%26%20Living',
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
          axios.get(`${API_URL}/api/products/public?sort=-sales&limit=4`),
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

        setLatestProducts(latestProductsData);
        setBestSellers(bestSellersData);
        setAnnouncements(announcementsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.response || error);
        // Set empty arrays to prevent undefined errors in the UI
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

  const categories = [
    { 
      name: 'Foodstuffs', 
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&h=600&q=80',
      description: 'Traditional Angolan foodstuffs and ingredients'
    },
    { 
      name: 'Drinks', 
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&h=600&q=80',
      description: 'Refreshing beverages and traditional drinks'
    },
    { 
      name: 'Fashion', 
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&h=600&q=80',
      description: 'Stylish clothing and accessories'
    },
    { 
      name: 'Home & Living', 
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&h=600&q=80',
      description: 'Furniture and home decor'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Regular Customer',
      comment: 'Excellent service and high-quality products. I always find what I need here.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      role: 'Verified Buyer',
      comment: 'Competitive prices and fast delivery. Highly recommend!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Local Business Owner',
      comment: 'The best retail store in Cabinda. Exceptional customer service.',
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
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-description">{slide.description}</p>
                {slide.buttonLink.includes('category=') ? (
                  <button 
                    onClick={(e) => handleCategoryClick(e, slide.buttonLink.split('category=')[1])}
                    className="cta-button"
                  >
                    {slide.buttonText}
                    <span className="button-arrow">→</span>
                  </button>
                ) : (
                  <Link 
                    to={slide.buttonLink} 
                    className="cta-button"
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

      {/* Announcements Section */}
      <section className="announcements">
        <div className="container">
          <h2>Latest Updates</h2>
          {loading ? (
            <div className="loading-overlay">
              <LoadingSpinner size="large" color="primary" />
            </div>
          ) : announcements.length === 0 ? (
            <div>No announcements available</div>
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
                    <span className="announcement-type">{announcement.category}</span>
                    <h3>
                      {announcement.title.length > 70 
                        ? `${announcement.title.substring(0, 70)}...` 
                        : announcement.title}
                    </h3>
                    <p>
                      {announcement.content.length > 200 
                        ? `${announcement.content.substring(0, 200)}... ` 
                        : announcement.content}
                      {announcement.content.length > 200 && (
                        <Link 
                          to={`/announcement/${announcement._id}`} 
                          className="read-more"
                          onClick={() => {
                            window.sessionStorage.setItem('lastViewedAnnouncement', announcement._id);
                          }}
                        >
                          Read More
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
        <h2>Featured Categories</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
              <p className="category-description">{category.description}</p>
              <button 
                className="category-link"
                onClick={(e) => handleCategoryClick(e, category.name.includes('&') ? encodeURIComponent(category.name) : category.name)}
              >
                View Products
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="best-sellers">
        <h2>Best Sellers</h2>
        {loading ? (
          <div className="loading-overlay">
            <LoadingSpinner size="large" color="primary" />
          </div>
        ) : bestSellers.length === 0 ? (
          <div>No best sellers available</div>
        ) : (
          <div className="products-grid">
            {bestSellers.map(product => (
              <div key={product._id} className="product-card">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  onError={(e) => {
                    console.error('Image failed to load:', {
                      product: product.name,
                      url: product.imageUrl
                    });
                    e.target.src = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80';
                  }}
                />
                <h3>{product.name}</h3>
                <p className="price">${product.price.toLocaleString()}</p>
                <a 
                  href={`https://wa.me/244938992743?text=I'm interested in ${encodeURIComponent(product.name)} priced at $${product.price}`} 
                  className="whatsapp-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp /> Chat on WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Weekly Offers Section */}
      <WeeklyOffers />

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature">
            <FaTruck className="feature-icon" />
            <h3>Fast Delivery</h3>
            <p>Delivery across Cabinda</p>
          </div>
          <div className="feature">
            <FaMoneyBillWave className="feature-icon" />
            <h3>Best Prices</h3>
            <p>Competitive prices guaranteed</p>
          </div>
          <div className="feature">
            <FaHeadset className="feature-icon" />
            <h3>24/7 Support</h3>
            <p>Dedicated customer service</p>
          </div>
          <div className="feature">
            <FaShieldAlt className="feature-icon" />
            <h3>Secure Shopping</h3>
            <p>100% satisfaction guarantee</p>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="latest-products">
        <h2>Latest Products</h2>
        {loading ? (
          <div className="loading-overlay">
            <LoadingSpinner size="large" color="primary" />
          </div>
        ) : latestProducts.length === 0 ? (
          <div>No products available</div>
        ) : (
          <div className="products-grid">
            {latestProducts.map(product => (
              <div key={product._id} className="product-card">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  onError={(e) => {
                    console.error('Image failed to load:', {
                      product: product.name,
                      url: product.imageUrl
                    });
                    e.target.src = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80';
                  }}
                />
                <h3>{product.name}</h3>
                <p className="price">${product.price.toLocaleString()}</p>
                <a 
                  href={`https://wa.me/244938992743?text=I want to buy ${encodeURIComponent(product.name)} priced at $${product.price}`} 
                  className="whatsapp-button buy-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp /> Buy on WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <img src={testimonial.avatar} alt={testimonial.name} className="avatar" />
              <p className="comment">{testimonial.comment}</p>
              <h4>{testimonial.name}</h4>
              <p className="role">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}

export default Home; 