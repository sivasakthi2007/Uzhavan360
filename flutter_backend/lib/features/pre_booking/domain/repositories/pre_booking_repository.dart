// Folder Path: lib/features/pre_booking/domain/repositories/
// Dart Filename: pre_booking_repository.dart

import '../entities/pre_booking_entity.dart';

abstract class PreBookingRepository {
  Future<List<PreBookingEntity>> getPreBookings();
  Future<PreBookingEntity> createPreBooking(PreBookingEntity entity);
  Future<void> updatePreBookingStatus(String bookingId, String status);
}
