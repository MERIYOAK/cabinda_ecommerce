# Retail Shop E-commerce Website - Cabinda, Angola

This is an e-commerce website built for a retail business in Cabinda, Angola. The website showcases products (foodstuffs & drinks) and allows customers to inquire about products via WhatsApp.

## Features

- Product catalog with categories
- Search and filtering functionality
- WhatsApp integration for product inquiries
- Admin panel for inventory management
- Store location with Google Maps integration
- Multilingual support (Portuguese & English)
- Weekly offers/promotions section
- Newsletter subscription

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Cloud Storage: AWS S3
- Maps Integration: Google Maps API

## Project Structure

```
├── frontend/           # React frontend application
├── backend/           # Node.js backend API
└── README.md          # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- AWS Account (for S3)
- Google Maps API Key

## Getting Started

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm start
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password
WHATSAPP_NUMBER=your_whatsapp_number
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_WHATSAPP_NUMBER=your_whatsapp_number
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 