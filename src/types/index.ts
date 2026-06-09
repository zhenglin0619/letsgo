export interface Dish {
  id: string;
  name: string;
  category: 'Appetizer' | 'Mains' | 'Dessert' | 'Drinks' | 'Snack';
  rating: number; // 0–5
  notes: string;
  photo?: string;
}

export interface DiningLog {
  id: string;
  restaurantName: string;
  cuisine: string;
  date: string;
  time: 'Breakfast' | 'Brunch' | 'Lunch' | 'Afternoon Tea' | 'Dinner' | 'Late Night';
  totalExpense: number;
  currency: string;
  overallRating: number; // 0–5
  location: { lat: number; lng: number; city: string; country: string; address?: string };
  photos: string[];
  dishes: Dish[];
  michelinStars?: 1 | 2 | 3;
}

export interface HotelLog {
  id: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rating: number;
  location: { lat: number; lng: number; city: string; country: string };
  photos: string[];
  notes: string;
  pricePerNight: number;
  currency: string;
}

export interface Trip {
  id: string;
  title: string;
  coverPhoto: string;
  startDate: string;
  endDate: string;
  countries: string[];
  city?: string;
  photos?: string[];
  hotels: HotelLog[];
  diningLogs: DiningLog[];
}
