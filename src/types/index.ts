export interface Dish {
  id: string;
  name: string;
  category: 'Appetizer' | 'Mains' | 'Dessert' | 'Drinks' | 'Snack';
  rating: number; // 0–10
  notes: string;
  photo?: string;
}

export interface DiningLog {
  id: string;
  restaurantName: string;
  cuisine: string;
  date: string;
  time: 'Breakfast' | 'Lunch' | 'Dinner' | 'Late Night';
  totalExpense: number;
  currency: string;
  vibeRating: number; // 1–5
  overallRating: number; // 0–10
  location: { lat: number; lng: number; city: string; country: string };
  photos: string[];
  dishes: Dish[];
  notes: string;
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
  subtitle: string;
  coverPhoto: string;
  startDate: string;
  endDate: string;
  countries: string[];
  hotels: HotelLog[];
  diningLogs: DiningLog[];
  tags: string[];
}
