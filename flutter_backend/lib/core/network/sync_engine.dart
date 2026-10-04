import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../database/app_database.dart';
import '../models/ooru_models.dart';
import 'supabase_service.dart';

class SyncEngine {
  static final SyncEngine instance = SyncEngine._internal();
  SyncEngine._internal();

  bool _isSyncing = false;

  Future<void> syncPendingOutbox() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      final items = await AppDatabase.instance.getPendingOutboxItems();
      if (items.isEmpty) {
        _isSyncing = false;
        return;
      }

      debugPrint('SyncEngine: Found ${items.length} pending operations to sync.');

      for (var item in items) {
        if (item.localId == null) continue;
        await AppDatabase.instance.updateOutboxState(item.localId!, 'SYNCING');

        bool success = false;
        try {
          final payload = jsonDecode(item.payloadJson) as Map<String, dynamic>;

          switch (item.operation) {
            case 'CREATE_REQUEST':
              final req = ServiceRequestModel.fromJson(payload);
              success = await SupabaseService.instance.createServiceRequest(req);
              break;
            case 'UPDATE_AVAILABILITY':
              final providerId = payload['provider_id'] as String;
              final status = payload['status'] as String;
              final availableDate = payload['available_date'] as String?;
              success = await SupabaseService.instance.updateProviderAvailability(providerId, status, availableDate: availableDate);
              break;
            case 'CREATE_VOUCH':
              final vouch = VouchModel.fromJson(payload);
              success = await SupabaseService.instance.addVouch(vouch);
              break;
            default:
              success = true;
          }
        } catch (e) {
          debugPrint('SyncEngine item ${item.localId} sync error: $e');
          success = false;
        }

        if (success) {
          await AppDatabase.instance.deleteOutboxItem(item.localId!);
          debugPrint('SyncEngine: Successfully synced item ${item.localId}');
        } else {
          final retries = item.retryCount + 1;
          if (retries > 5) {
            await AppDatabase.instance.updateOutboxState(item.localId!, 'FAILED', retryCount: retries);
          } else {
            await AppDatabase.instance.updateOutboxState(item.localId!, 'PENDING', retryCount: retries);
          }
        }
      }
    } finally {
      _isSyncing = false;
    }
  }
}
