export interface PhotoTransform {
  x: number;     // translate X as % of element width (0 = centered)
  y: number;     // translate Y as % of element height (0 = centered)
  scale: number; // zoom level (1 = no zoom)
}

export interface Dish {
  id: string;
  name: string;
  category: 'Appetizer' | 'Mains' | 'Dessert' | 'Drinks' | 'Snack';
  rating: number; // 0–5
  notes: string;
  photo?: string;
  photoTransform?: PhotoTransform;
}

export interface DiningLog {
  id: string;
  ownerId?: string;
  restaurantName: string;
  cuisine: string;
  date: string;
  time?: 'Breakfast' | 'Brunch' | 'Lunch' | 'Afternoon Tea' | 'Dinner' | 'Late Night';
  totalExpense: number;
  currency: string;
  overallRating: number; // 0–5
  location: { lat: number; lng: number; city: string; country: string; address?: string };
  photos: string[];
  photoTransform?: PhotoTransform;
  dishes: Dish[];
  michelinStars?: 1 | 2 | 3;
}

export interface HotelLog {
  id: string;
  ownerId?: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rating: number;
  roomType?: string;
  viewType?: string;
  location: { lat: number; lng: number; city: string; country: string; address?: string };
  photos: string[];
  photoTransform?: PhotoTransform;
  notes: string;
  pricePerNight: number;
  currency: string;
}

export interface Trip {
  id: string;
  ownerId?: string;
  title: string;
  coverPhoto: string;
  coverPhotoTransform?: PhotoTransform;
  startDate: string;
  endDate: string;
  countries: string[];
  city?: string;
  photos?: string[];
  hotels: HotelLog[];
  diningLogs: DiningLog[];
}
