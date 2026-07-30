// Folder Path: lib/core/di/
// Dart Filename: providers.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../storage/secure_storage_service.dart';
import '../storage/database_helper.dart';
import '../network/sync_queue_manager.dart';
import '../network/sync_engine.dart';
import '../services/auth_service.dart';
import '../services/ble_service.dart';
import '../services/wifi_direct_service.dart';

// 1. Storage Providers
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final dbHelperProvider = Provider<DatabaseHelper>((ref) {
  return DatabaseHelper(ref.watch(secureStorageProvider));
});

// 2. Network Providers
final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final syncQueueProvider = Provider<SyncQueueManager>((ref) {
  return SyncQueueManager(ref.watch(dbHelperProvider));
});

final syncEngineProvider = Provider<SyncEngine>((ref) {
  return SyncEngine(
    ref.watch(syncQueueProvider),
    ref.watch(dbHelperProvider),
    ref.watch(supabaseClientProvider),
  );
});

// 3. System Services Providers
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(
    ref.watch(supabaseClientProvider),
    ref.watch(secureStorageProvider),
  );
});

final bleServiceProvider = Provider<BLEService>((ref) {
  return BLEService();
});

final wifiDirectServiceProvider = Provider<WifiDirectService>((ref) {
  return WifiDirectService();
});
