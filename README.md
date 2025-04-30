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
- `/v1/livestock/health-records/{animalId}` - Get health records for specific animals
- `/v1/livestock/milk-production/{animalId}` - Get milk production data for female cows

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
