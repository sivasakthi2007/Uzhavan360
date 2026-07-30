// Folder Path: lib/features/pre_booking/data/repositories/
// Dart Filename: pre_booking_repository_impl.dart

import '../../domain/repositories/pre_booking_repository.dart';
import '../../domain/entities/pre_booking_entity.dart';
import '../datasources/pre_booking_local_datasource.dart';
import '../datasources/pre_booking_remote_datasource.dart';
import '../models/pre_booking_model.dart';
import '../../../../core/network/sync_queue_manager.dart';

class PreBookingRepositoryImpl implements PreBookingRepository {
  final PreBookingLocalDataSource localSource;
  final PreBookingRemoteDataSource remoteSource;
  final SyncQueueManager syncQueue;
  final bool isOnline;

  PreBookingRepositoryImpl({
    required this.localSource,
    required this.remoteSource,
    required this.syncQueue,
    required this.isOnline,
  });

  @override
  Future<List<PreBookingEntity>> getPreBookings() async {
    if (isOnline) {
      try {
        final cloudList = await remoteSource.fetchPreBookingsFromCloud();
        for (var item in cloudList) {
          await localSource.cachePreBooking(item, isDirty: false);
        }
        return cloudList;
      } catch (_) {
        // Fallback to local on API failure
      }
    }
    return await localSource.getCachedPreBookings();
  }

  @override
  Future<PreBookingEntity> createPreBooking(PreBookingEntity entity) async {
    final model = PreBookingModel.fromEntity(entity);

    if (isOnline) {
      try {
        final createdCloud = await remoteSource.createPreBookingOnCloud(model);
        await localSource.cachePreBooking(createdCloud, isDirty: false);
        return createdCloud;
      } catch (_) {
        // Queue change on API timeout or network drop
      }
    }

    // Offline Sync Fallback flow
    await localSource.cachePreBooking(model, isDirty: true);
    await syncQueue.enqueue(
      tableName: 'harvest_pre_bookings',
      action: 'INSERT',
      recordId: model.id,
      payload: model.toJson(),
    );
    return model;
  }

  @override
  Future<void> updatePreBookingStatus(String bookingId, String status) async {
    if (isOnline) {
      try {
        await remoteSource.updateStatusOnCloud(bookingId, status);
        final List<PreBookingModel> cachedList = await localSource.getCachedPreBookings();
        final match = cachedList.firstWhere((element) => element.id == bookingId);
        final updatedModel = PreBookingModel.fromEntity(match.copyWith(status: status));
        await localSource.cachePreBooking(updatedModel, isDirty: false);
        return;
      } catch (_) {}
    }

    // Offline update status flow
    await localSource.updateStatusInCache(bookingId, status);
    final List<PreBookingModel> cachedList = await localSource.getCachedPreBookings();
    final match = cachedList.firstWhere((element) => element.id == bookingId);
    await syncQueue.enqueue(
      tableName: 'harvest_pre_bookings',
      action: 'UPDATE',
      recordId: bookingId,
      payload: PreBookingModel.fromEntity(match.copyWith(status: status)).toJson(),
    );
  }
}
