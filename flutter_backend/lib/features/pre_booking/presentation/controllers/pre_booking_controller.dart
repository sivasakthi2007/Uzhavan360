// Folder Path: lib/features/pre_booking/presentation/controllers/
// Dart Filename: pre_booking_controller.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/pre_booking_entity.dart';
import '../../domain/repositories/pre_booking_repository.dart';
import '../../../../core/di/providers.dart';

// Extension provider binding the Pre-Booking repository implementation
final preBookingRepositoryProvider = Provider<PreBookingRepository>((ref) {
  // Watch core data providers dynamically
  final local = PreBookingLocalDataSource(ref.watch(dbHelperProvider));
  final remote = PreBookingRemoteDataSource(ref.watch(supabaseClientProvider));
  final syncQ = ref.watch(syncQueueProvider);
  
  // Real apps watch connectivity state provider
  const bool isOnline = true; 

  return PreBookingRepositoryImpl(
    localSource: local,
    remoteSource: remote,
    syncQueue: syncQ,
    isOnline: isOnline,
  );
});

class PreBookingLocalDataSource {
  final DatabaseHelper _dbHelper;
  PreBookingLocalDataSource(this._dbHelper);
}
class PreBookingRemoteDataSource {
  final SupabaseClient _client;
  PreBookingRemoteDataSource(this._client);
}
class PreBookingRepositoryImpl implements PreBookingRepository {
  final PreBookingLocalDataSource localSource;
  final PreBookingRemoteDataSource remoteSource;
  final SyncQueueManager syncQueue;
  final bool isOnline;
  PreBookingRepositoryImpl({required this.localSource, required this.remoteSource, required this.syncQueue, required this.isOnline});
  
  @override
  Future<List<PreBookingEntity>> getPreBookings() async => [];
  @override
  Future<PreBookingEntity> createPreBooking(PreBookingEntity entity) async => entity;
  @override
  Future<void> updatePreBookingStatus(String bookingId, String status) async {}
}

class PreBookingNotifier extends AsyncNotifier<List<PreBookingEntity>> {
  late final PreBookingRepository _repository;

  @override
  Future<List<PreBookingEntity>> build() async {
    _repository = ref.watch(preBookingRepositoryProvider);
    return await _repository.getPreBookings();
  }

  Future<void> addNewPreBooking(PreBookingEntity entity) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repository.createPreBooking(entity);
      return await _repository.getPreBookings();
    });
  }

  Future<void> setBookingStatus(String bookingId, String status) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repository.updatePreBookingStatus(bookingId, status);
      return await _repository.getPreBookings();
    });
  }
}

final preBookingNotifierProvider = AsyncNotifierProvider<PreBookingNotifier, List<PreBookingEntity>>(() {
  return PreBookingNotifier();
});
