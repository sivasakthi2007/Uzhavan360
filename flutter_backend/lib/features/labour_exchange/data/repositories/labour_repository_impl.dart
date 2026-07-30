// Folder Path: lib/features/labour_exchange/data/repositories/
// Dart Filename: labour_repository_impl.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/entities/labour_entity.dart';
import '../models/labour_model.dart';
import '../../../../core/storage/database_helper.dart';
import '../../../../core/network/sync_queue_manager.dart';

abstract class LabourRepository {
  Future<List<LabourWorkerEntity>> searchWorkers(String district);
  Future<LabourBookingEntity> bookLabour(LabourBookingEntity booking);
}

class LabourRepositoryImpl implements LabourRepository {
  final DatabaseHelper dbHelper;
  final SupabaseClient supabase;
  final SyncQueueManager syncQueue;
  final bool isOnline;

  LabourRepositoryImpl({
    required this.dbHelper,
    required this.supabase,
    required this.syncQueue,
    required this.isOnline,
  });

  @override
  Future<List<LabourWorkerEntity>> searchWorkers(String district) async {
    if (isOnline) {
      try {
        final response = await supabase
            .from('labour_registrations')
            .select()
            .eq('preferred_district', district);
        final List<dynamic> data = response as List<dynamic>;
        return data.map((json) => LabourWorkerModel.fromJson(json)).toList();
      } catch (_) {}
    }
    return []; // Local search fallback can query SQLite if cache matches
  }

  @override
  Future<LabourBookingEntity> bookLabour(LabourBookingEntity booking) async {
    final model = LabourBookingModel.fromEntity(booking);

    if (isOnline) {
      try {
        final response = await supabase
            .from('labour_bookings')
            .insert(model.toJson())
            .select()
            .single();
        return LabourBookingModel.fromJson(response);
      } catch (_) {}
    }

    // Queue booking offline
    await syncQueue.enqueue(
      tableName: 'labour_bookings',
      action: 'INSERT',
      recordId: model.id,
      payload: model.toJson(),
    );
    return model;
  }
}
