// Folder Path: lib/features/shared_transport/presentation/controllers/
// Dart Filename: transport_controller.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/transport_entity.dart';
import '../repositories/transport_repository_impl.dart';
import '../../../../core/di/providers.dart';

final transportRepositoryProvider = Provider<TransportRepository>((ref) {
  return TransportRepositoryImpl(
    dbHelper: ref.watch(dbHelperProvider),
    supabase: ref.watch(supabaseClientProvider),
    syncQueue: ref.watch(syncQueueProvider),
    isOnline: true,
  );
});

class TransportBookingNotifier extends AsyncNotifier<List<TransportBookingEntity>> {
  late final TransportRepository _repository;

  @override
  Future<List<TransportBookingEntity>> build() async {
    _repository = ref.watch(transportRepositoryProvider);
    return [];
  }

  Future<void> requestSpaceBooking(TransportBookingEntity booking) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repository.bookSpace(booking);
      return [];
    });
  }
}

final transportBookingNotifierProvider = AsyncNotifierProvider<TransportBookingNotifier, List<TransportBookingEntity>>(() {
  return TransportBookingNotifier();
});
