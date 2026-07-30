// Folder Path: lib/features/labour_exchange/presentation/controllers/
// Dart Filename: labour_controller.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/labour_entity.dart';
import '../repositories/labour_repository_impl.dart';
import '../../../../core/di/providers.dart';

final labourRepositoryProvider = Provider<LabourRepository>((ref) {
  return LabourRepositoryImpl(
    dbHelper: ref.watch(dbHelperProvider),
    supabase: ref.watch(supabaseClientProvider),
    syncQueue: ref.watch(syncQueueProvider),
    isOnline: true, // Typically binds to connectivity provider
  );
});

class LabourBookingNotifier extends AsyncNotifier<List<LabourBookingEntity>> {
  late final LabourRepository _repository;

  @override
  Future<List<LabourBookingEntity>> build() async {
    _repository = ref.watch(labourRepositoryProvider);
    return []; // Yield local booking agreements list in production
  }

  Future<void> requestHiring(LabourBookingEntity booking) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repository.bookLabour(booking);
      return []; // Re-fetch list
    });
  }
}

final labourBookingNotifierProvider = AsyncNotifierProvider<LabourBookingNotifier, List<LabourBookingEntity>>(() {
  return LabourBookingNotifier();
});
