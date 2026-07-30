'use client';

import BookingCard from './BookingCard';
import { RentalBooking } from '@/context/AppContext';

interface RentalHistoryCardProps {
  booking: RentalBooking;
  onCancel?: (id: string) => void;
}

export default function RentalHistoryCard({ booking, onCancel }: RentalHistoryCardProps) {
  return <BookingCard booking={booking} onCancel={onCancel} />;
}
