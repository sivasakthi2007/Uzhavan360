// Folder Path: lib/features/cold_storage/data/repositories/
// Dart Filename: warehouse_repository_impl.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/entities/warehouse_entity.dart';
import '../models/warehouse_model.dart';
import '../../../../core/storage/database_helper.dart';
import '../../../../core/network/sync_queue_manager.dart';

abstract class WarehouseRepository {
  Future<List<WarehouseEntity>> getWarehouses(String district);
  Future<WarehouseBookingEntity> bookStorageSpace(WarehouseBookingEntity booking);
}

class WarehouseRepositoryImpl implements WarehouseRepository {
  final DatabaseHelper dbHelper;
  final SupabaseClient supabase;
  final SyncQueueManager syncQueue;
  final bool isOnline;

  WarehouseRepositoryImpl({
    required this.dbHelper,
    required this.supabase,
    required this.syncQueue,
    required this.isOnline,
  });

  @override
  Future<List<WarehouseEntity>> getWarehouses(String district) async {
    if (isOnline) {
      try {
        final response = await supabase
            .from('warehouses')
            .select()
            .eq('district', district);
        final List<dynamic> data = response as List<dynamic>;
        return data.map((json) => WarehouseModel.fromJson(json)).toList();
      } catch (_) {}
    }
    return []; // Cache fallback can query SQLite if cache matches
  }

  @override
  Future<WarehouseBookingEntity> bookStorageSpace(WarehouseBookingEntity booking) async {
    final model = WarehouseBookingModel.fromEntity(booking);

    if (isOnline) {
      try {
        final response = await supabase
            .from('warehouse_bookings')
            .insert(model.toJson())
            .select()
            .single();
        return WarehouseBookingModel.fromJson(response);
      } catch (_) {}
    }

    // Queue booking offline
    await syncQueue.enqueue(
      tableName: 'warehouse_bookings',
      action: 'INSERT',
      recordId: model.id,
      payload: model.toJson(),
    );
    return model;
  }
}
