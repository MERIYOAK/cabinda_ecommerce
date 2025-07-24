import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ScrollNavbar from './components/ScrollNavbar';
import Footer from './components/Footer';
import AppRoutes from './routes';
import { ScrollToTop } from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import { DarkModeProvider } from './contexts/DarkModeContext';
import './App.css';
import './components/WhatsAppFloatingButton.css';
import ThemeToggleButton from './components/ThemeToggleButton';
import './dark-mode.css';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import CookieConsentBanner from './components/CookieConsentBanner';
import Cookies from 'js-cookie';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
      light: '#3395ff',
      dark: '#0056b3',
    },
    secondary: {
      main: '#6c757d',
      light: '#868e96',
      dark: '#495057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Arial", "Helvetica", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const GA_ID = process.env.REACT_APP_GA_ID || '';
  React.useEffect(() => {
    const consent = Cookies.get('cookieConsent') || localStorage.getItem('cookieConsent');
    if (consent === 'accepted' && GA_ID) {
      // Dynamically load Google Analytics or other tracking scripts
      if (!window.gtagScriptLoaded) {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        script.async = true;
        document.body.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);
        window.gtagScriptLoaded = true;
      }
    }
  }, [GA_ID]);
  return (
    <DarkModeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ScrollToTop />
          <WhatsAppFloatingButton />
          <div className="App">
            <ScrollNavbar />
            <InstallPwaPrompt />
            <ThemeToggleButton />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Footer />
            <ScrollToTopButton />
            <CookieConsentBanner />
          </div>
        </Router>
      </ThemeProvider>
    </DarkModeProvider>
  );
}

export default App; 