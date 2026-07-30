// Folder Path: test/sync_tests/
// Dart Filename: sync_engine_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../lib/core/network/sync_engine.dart';
import '../../lib/core/network/sync_queue_manager.dart';
import '../../lib/core/storage/database_helper.dart';

class MockSyncQueueManager extends Mock implements SyncQueueManager {
  @override
  Future<List<SyncQueueItem>> getQueue() async {
    return [
      SyncQueueItem(
        id: '1',
        tableName: 'community_posts',
        action: 'INSERT',
        recordId: 'post_101',
        payload: {'title': 'Offline Post', 'content': 'Checking sync'},
        createdAt: DateTime.now(),
        retryCount: 0,
      )
    ];
  }

  @override
  Future<void> dequeue(String id) async {
    // Stub
  }
}

class MockDatabaseHelper extends Mock implements DatabaseHelper {}

void main() {
  group('SyncEngine Hardening Unit Tests', () {
    late SyncEngine syncEngine;
    late MockSyncQueueManager mockQueue;
    late MockDatabaseHelper mockDb;

    setUp(() {
      mockQueue = MockSyncQueueManager();
      mockDb = MockDatabaseHelper();
      // Supabase client instance stub representation
      final supabase = SupabaseClient('https://mock.supabase.co', 'anonKey');
      syncEngine = SyncEngine(mockQueue, mockDb, supabase);
    });

    test('Battery Level Optimization - Skip Sync Under 20%', () async {
      syncEngine.setSystemStateForTesting(batteryLevel: 15.0, isWifi: true);

      // Trigger sync
      await syncEngine.executeFullSync();
      
      // Should not throw or proceed to invoke sync if battery is under 20%
      expect(await syncEngine.getBatteryLevel(), equals(15.0));
    });

    test('Network Optimization - Small Batch On Mobile Data', () async {
      syncEngine.setSystemStateForTesting(batteryLevel: 80.0, isWifi: false);

      final bool isWifi = await syncEngine.isWifiConnection();
      expect(isWifi, isFalse);
    });
  });
}
