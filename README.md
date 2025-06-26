# Pharmacy Inventory Management System

A comprehensive inventory management system for pharmacies and warehouses built with React and Supabase.

## Features

### Pharmacy Panel
- **Inventory Management**: Complete CRUD operations for medicines
- **Real-time Alerts**: Low stock and expiry date notifications
- **Dashboard Analytics**: Visual statistics and inventory overview
- **Threshold Management**: Set custom reorder levels for each medicine

### Warehouse Panel
- **Request Management**: View and process pharmacy inventory requests
- **Status Tracking**: Update request status (pending → prepared → delivered)
- **Real-time Updates**: Live updates for request status changes
- **Filtering**: Filter requests by status for better organization

### Security & Authentication
- **Role-based Access**: Pharmacy and warehouse user roles
- **Row Level Security**: Database-level security policies
- **Secure Authentication**: Email/password authentication with Supabase

### Automation
- **Automated Reordering**: Edge function checks inventory every 6 hours
- **Smart Requests**: Automatically creates requests for low stock items
- **Real-time Sync**: Live updates across all connected clients

## Technology Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Icons**: Lucide React
- **Automation**: Supabase Edge Functions

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the migration file in the SQL editor
   - Copy your project URL and anon key

4. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

The system uses the following database schema:

#### Tables
- **medicines**: Stores medicine inventory data
- **requests**: Manages reorder requests between pharmacy and warehouse

#### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Secure user authentication

### User Roles

**Pharmacy Users:**
- Manage their medicine inventory
- View low stock alerts
- View reorder requests
- Set reorder thresholds

**Warehouse Users:**
- View all reorder requests
- Update request status
- Manage request fulfillment

### Automation

The system includes an Edge Function (`inventory-checker`) that:
- Runs periodically to check inventory levels
- Automatically creates reorder requests for low stock items
- Prevents duplicate requests for the same medicines
- Calculates optimal reorder quantities

To deploy the Edge Function:
1. Install Supabase CLI
2. Deploy the function:
   ```bash
   supabase functions deploy inventory-checker
   ```

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── stores/             # State management
├── lib/                # Utilities and configurations
└── main.jsx           # Application entry point
```

### Key Components
- **AuthPage**: User authentication interface
- **PharmacyDashboard**: Main pharmacy interface
- **WarehouseDashboard**: Warehouse management interface
- **MedicineForm**: Add/edit medicine modal
- **Layout**: Common layout wrapper

## Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Database (Supabase)
1. Your Supabase project is already hosted
2. Configure your production environment variables
3. Set up Edge Function for automation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.