# Farm Management App

A React Native mobile application for managing farm operations with a focus on animal record management. This app helps farmers keep track of their livestock, monitor health records, and track milk production.

## Features

### Animal Management
- **Complete CRUD Operations**: Add, view, update, and delete animal records
- **Animal Records List**: 
  - Pagination for efficient loading of large datasets
  - Search functionality to quickly find specific animals
  - Filter by animal type (Cow, Bull, Heifer, Calf)
  - Pull-to-refresh for latest data updates
  - Beautiful card UI showing animal details and quick actions

- **Animal Details**:
  - Comprehensive view of animal information
  - Animal images and basic information display
  - Health status badges
  - Location and shed information
  - Health records history
  - Milk production data tracking for female cows
  - Edit and delete functionality

- **Animal Data Editing**:
  - Pre-populated form fields from API data
  - Image upload capability
  - Form validation
  - Dropdown selectors for shed locations and lactation status

### Health Records Management
- **Complete CRUD Operations**: Add, view, update, and delete health records
- **Health Records List**:
  - Pagination for efficient loading of large datasets
  - Search functionality to quickly find specific health records
  - Filter by health status (Healthy, Sick, Under Treatment)
  - Pull-to-refresh for latest data updates
  - Card UI showing important health record details

- **Health Record Creation**:
  - Select animal from existing records
  - Choose veterinarian from registered veterinarians
  - Record diagnosis, treatment, and notes
  - Set health status and next checkup date
  - Form validation for required fields

### Veterinarian Management
- **Complete CRUD Operations**: Add, view, update, and delete veterinarians
- **Veterinarian List**:
  - Search functionality to quickly find specific veterinarians
  - Pagination for efficient loading of large datasets
  - Pull-to-refresh for latest data updates
  - Card UI showing veterinarian details

- **Veterinarian Creation/Editing**:
  - Record essential information (name, contact, address)
  - Optional fields for specialty, license number, and email
  - Modal form for quick addition without leaving the current flow
  - Form validation for required fields

- **Integration with Health Records**:
  - Quick access to add new veterinarians from health record creation
  - Seamless workflow between veterinarian management and health records

### Vaccine Management (Coming Soon)
- Registration of vaccines with dosage and interval information
- Associate vaccines with health records
- Track vaccination schedules

## Screenshots
(Add screenshots here)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/farmapp.git
cd farmapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Usage

### Animal Management
- View all animals in the "Animal Records" screen
- Use the search bar to find specific animals by name, tag ID, or other attributes
- Filter the list by animal type using the filter buttons
- Pull down to refresh the list with the latest data
- Tap on an animal card to view detailed information
- Use the edit and delete buttons for quick actions
- Add a new animal by tapping the "+" button in the header

### Health Records
- View all health records in the "Health Records" screen
- Search for specific records by diagnosis, treatment, or animal name
- Filter records by health status (Healthy, Sick, Under Treatment)
- Tap on a record to view detailed information
- Add new health records with animal, veterinarian, and treatment details
- Edit or delete existing health records as needed

### Veterinarians
- Manage veterinarians in the dedicated veterinarian management screen
- Search for specific veterinarians by name or specialty
- Add new veterinarians via the modal form
- Edit or delete existing veterinarian records
- Associate veterinarians with health records during creation

## Technologies Used

- React Native
- TypeScript
- Expo
- React Navigation
- RESTful API integration

## API Integration

The app connects to a RESTful API for all data operations:
- `/v1/livestock/animals` - Get all animals with pagination, filtering, and search
- `/v1/livestock/animals/{id}` - Get, update, or delete specific animal records
- `/v1/livestock/animals` (POST) - Create new animal records
- `/v1/livestock/health/records` - Get all health records with pagination and search
- `/v1/livestock/health/records/{id}` - Get, update, or delete specific health records
- `/v1/livestock/health/records` (POST) - Create new health records
- `/v1/livestock/veterinarians` - Get all veterinarians with pagination and search
- `/v1/livestock/veterinarians/{id}` - Get, update, or delete specific veterinarian records
- `/v1/livestock/veterinarians` (POST) - Create new veterinarian records
- `/v1/livestock/vaccines` - Get all vaccines with pagination and search
- `/v1/livestock/vaccines/{id}` - Get, update, or delete specific vaccine records
- `/v1/livestock/vaccines` (POST) - Create new vaccine records

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
