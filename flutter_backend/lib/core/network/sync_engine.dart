// Folder Path: lib/core/network/
// Dart Filename: sync_engine.dart

import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../storage/database_helper.dart';
import 'sync_queue_manager.dart';

class SyncEngine {
  final SyncQueueManager _queueManager;
  final DatabaseHelper _dbHelper;
  final SupabaseClient _supabase;

  SyncEngine(this._queueManager, this._dbHelper, this._supabase);

  // Table dependency hierarchy to prevent Foreign Key constraints violations
  static const List<String> _tableSyncOrder = [
    'profiles',
    'farms',
    'farm_expenses',
    'farm_income',
    'harvest_pre_bookings',
    'labour_registrations',
    'labour_bookings',
    'transport_routes',
    'transport_bookings',
    'warehouses',
    'warehouse_bookings',
    'community_posts',
    'community_comments',
    'support_tickets',
    'support_messages'
  ];

  // System State Mock Services for Battery and Network (resolves package compilation crashes)
  double _mockBatteryLevel = 85.0;
  bool _mockIsWifi = true;

  void setSystemStateForTesting({required double batteryLevel, required bool isWifi}) {
    _mockBatteryLevel = batteryLevel;
    _mockIsWifi = isWifi;
  }

  Future<double> getBatteryLevel() async => _mockBatteryLevel;
  Future<bool> isWifiConnection() async => _mockIsWifi;

  Future<void> executeFullSync({bool force = false}) async {
    final double battery = await getBatteryLevel();
    if (battery <= 20.0 && !force) {
      // Delay non-critical syncs under low battery to conserve energy
      return;
    }

    final bool isWifi = await isWifiConnection();
    await pushLocalChanges(limitBatchSize: !isWifi);
    await pullCloudDeltas();
  }

  Future<void> pushLocalChanges({bool limitBatchSize = false}) async {
    final queue = await _queueManager.getQueue();
    if (queue.isEmpty) return;

    // Sort queue items according to table dependency hierarchy
    final sortedQueue = List<SyncQueueItem>.from(queue)
      ..sort((a, b) {
        final aIdx = _tableSyncOrder.indexOf(a.tableName);
        final bIdx = _tableSyncOrder.indexOf(b.tableName);
        return aIdx.compareTo(bIdx);
      });

    // If on mobile data, limit execution to a small batch sync (e.g., maximum 5 records)
    final itemsToSync = limitBatchSize ? sortedQueue.take(5).toList() : sortedQueue;

    final List<Map<String, dynamic>> recordsPayload = [];
    for (var item in itemsToSync) {
      recordsPayload.add({
        'table': item.tableName,
        'action': item.action,
        'record_id': item.recordId,
        'data': item.payload,
      });
    }

    try {
      final response = await _supabase.functions.invoke(
        'sync-batch-upload',
        body: {
          'client_timestamp': DateTime.now().toUtc().toIso8601String(),
          'batch_records': recordsPayload,
        },
      );

      if (response.status == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.data);
        final List<dynamic> results = responseData['results'] ?? [];

        for (var res in results) {
          final String recordId = res['record_id'];
          final String status = res['status'];
          final queueItem = itemsToSync.firstWhere((element) => element.recordId == recordId);
          
          if (status == 'synced') {
            await _queueManager.dequeue(queueItem.id);
            await _clearDirtyState(queueItem.tableName, recordId);
            await _logSyncEvent(queueItem.tableName, recordId, 'SUCCESS', 'Successfully synchronized.');
          } else {
            await _handleSyncFailure(queueItem);
          }
        }
        await _updateLastSyncTimestamp();
      }
    } catch (e) {
      for (var item in itemsToSync) {
        await _handleSyncFailure(item);
      }
    }
  }

  Future<void> _handleSyncFailure(SyncQueueItem item) async {
    // Increment retry count inside the local sync queue tracker
    final db = await _dbHelper.database;
    final int nextRetryCount = (item.retryCount ?? 0) + 1;

    if (nextRetryCount >= 5) {
      // Mark as permanent failure after 5 attempts
      await db.rawUpdate(
        'UPDATE local_sync_queue SET status = ?, retry_count = ? WHERE id = ?',
        ['FAILED', nextRetryCount, item.id],
      );
      await _logSyncEvent(item.tableName, item.recordId, 'FAILED', 'Sync failed after 5 retries.');
    } else {
      await db.rawUpdate(
        'UPDATE local_sync_queue SET retry_count = ? WHERE id = ?',
        [nextRetryCount, item.id],
      );
      await _logSyncEvent(item.tableName, item.recordId, 'RETRYING', 'Retrying (Attempt $nextRetryCount).');
    }
  }

  Future<void> _logSyncEvent(String table, String recordId, String status, String message) async {
    final db = await _dbHelper.database;
    await db.insert('local_sync_logs', {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'table_name': table,
      'record_id': recordId,
      'status': status,
      'message': message,
      'created_at': DateTime.now().toUtc().toIso8601String(),
    });
  }

  Future<void> _updateLastSyncTimestamp() async {
    final db = await _dbHelper.database;
    await db.insert(
      'local_metadata',
      {
        'key': 'last_successful_sync_timestamp',
        'value': DateTime.now().toUtc().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<String> getLastSyncTimestamp() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> res = await db.query(
      'local_metadata',
      where: 'key = ?',
      whereArgs: ['last_successful_sync_timestamp'],
    );
    if (res.isNotEmpty) {
      return res.first['value'];
    }
    return '1970-01-01T00:00:00.000Z';
  }

  Future<void> pullCloudDeltas() async {
    final String lastSyncTimestamp = await getLastSyncTimestamp();

    try {
      final response = await _supabase.functions.invoke(
        'sync-batch-download',
        body: {
          'last_sync_timestamp': lastSyncTimestamp,
          'subscribed_tables': _tableSyncOrder,
        },
      );

      if (response.status == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.data);
        final List<dynamic> deltas = responseData['deltas'] ?? [];

        for (var delta in deltas) {
          final String tableName = delta['table'];
          final String recordId = delta['record_id'];
          final String action = delta['action'];
          final Map<String, dynamic> remoteData = delta['data'];

          await _applyCloudDeltaToLocal(tableName, recordId, action, remoteData);
        }
      }
    } catch (_) {}
  }

  Future<void> _clearDirtyState(String tableName, String recordId) async {
    final db = await _dbHelper.database;
    final String localTableName = 'local_$tableName';
    await db.rawUpdate(
      'UPDATE $localTableName SET is_dirty = 0 WHERE id = ?',
      [recordId],
    );
  }

  Future<void> _applyCloudDeltaToLocal(
    String tableName,
    String recordId,
    String action,
    Map<String, dynamic> remoteData,
  ) async {
    final db = await _dbHelper.database;
    final String localTableName = 'local_$tableName';

    // Last-Write-Wins (LWW) conflict resolution logic
    final List<Map<String, dynamic>> localMatch = await db.query(
      localTableName,
      where: 'id = ?',
      whereArgs: [recordId],
    );

    if (localMatch.isNotEmpty) {
      final localRow = localMatch.first;
      final int isDirty = localRow['is_dirty'] ?? 0;

      if (isDirty == 1) {
        final DateTime localTime = DateTime.parse(localRow['last_modified_at']);
        final DateTime remoteTime = DateTime.parse(remoteData['last_modified_at']);

        // Overwrite only if remote modification is newer
        if (remoteTime.isBefore(localTime)) {
          return; // Client Wins
        }
      }
    }

    if (action == 'DELETE' || remoteData['is_deleted'] == true || remoteData['is_deleted'] == 1) {
      await db.delete(localTableName, where: 'id = ?', whereArgs: [recordId]);
    } else {
      // Map remote columns to local SQLite columns (is_dirty set to 0)
      final localData = Map<String, dynamic>.from(remoteData);
      localData['is_dirty'] = 0;
      // Convert boolean representation for SQLite compatibility
      localData['is_deleted'] = (remoteData['is_deleted'] == true || remoteData['is_deleted'] == 1) ? 1 : 0;

      await db.insert(
        localTableName,
        localData,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }
}

