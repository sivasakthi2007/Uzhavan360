// Folder Path: lib/features/cold_storage/presentation/controllers/
// Dart Filename: warehouse_controller.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/warehouse_entity.dart';
import '../repositories/warehouse_repository_impl.dart';
import '../../../../core/di/providers.dart';

final warehouseRepositoryProvider = Provider<WarehouseRepository>((ref) {
  return WarehouseRepositoryImpl(
    dbHelper: ref.watch(dbHelperProvider),
    supabase: ref.watch(supabaseClientProvider),
    syncQueue: ref.watch(syncQueueProvider),
    isOnline: true,
  );
});

class WarehouseBookingNotifier extends AsyncNotifier<List<WarehouseBookingEntity>> {
  late final WarehouseRepository _repository;

  @override
  Future<List<WarehouseBookingEntity>> build() async {
    _repository = ref.watch(warehouseRepositoryProvider);
    return [];
  }

  Future<void> submitBooking(WarehouseBookingEntity booking) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repository.bookStorageSpace(booking);
      return [];
    });
  }
}

final warehouseBookingNotifierProvider = AsyncNotifierProvider<WarehouseBookingNotifier, List<WarehouseBookingEntity>>(() {
  return WarehouseBookingNotifier();
});
