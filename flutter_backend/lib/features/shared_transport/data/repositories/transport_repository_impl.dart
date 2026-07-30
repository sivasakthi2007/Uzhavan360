// Folder Path: lib/features/shared_transport/data/repositories/
// Dart Filename: transport_repository_impl.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/entities/transport_entity.dart';
import '../models/transport_model.dart';
import '../../../../core/storage/database_helper.dart';
import '../../../../core/network/sync_queue_manager.dart';

abstract class TransportRepository {
  Future<List<TransportRouteEntity>> getActiveRoutes(String from, String to);
  Future<TransportBookingEntity> bookSpace(TransportBookingEntity booking);
}

class TransportRepositoryImpl implements TransportRepository {
  final DatabaseHelper dbHelper;
  final SupabaseClient supabase;
  final SyncQueueManager syncQueue;
  final bool isOnline;

  TransportRepositoryImpl({
    required this.dbHelper,
    required this.supabase,
    required this.syncQueue,
    required this.isOnline,
  });

  @override
  Future<List<TransportRouteEntity>> getActiveRoutes(String from, String to) async {
    if (isOnline) {
      try {
        final response = await supabase
            .from('transport_routes')
            .select()
            .eq('route_from', from)
            .eq('route_to', to)
            .eq('status', 'scheduled');
        final List<dynamic> data = response as List<dynamic>;
        return data.map((json) => TransportRouteModel.fromJson(json)).toList();
      } catch (_) {}
    }
    return []; // Optional local SQLite queries mapping cache
  }

  @override
  Future<TransportBookingEntity> bookSpace(TransportBookingEntity booking) async {
    final model = TransportBookingModel.fromEntity(booking);

    if (isOnline) {
      try {
        final response = await supabase
            .from('transport_bookings')
            .insert(model.toJson())
            .select()
            .single();
        return TransportBookingModel.fromJson(response);
      } catch (_) {}
    }

    // Queue booking offline
    await syncQueue.enqueue(
      tableName: 'transport_bookings',
      action: 'INSERT',
      recordId: model.id,
      payload: model.toJson(),
    );
    return model;
  }
}
