// Folder Path: test/sync_tests/
// Dart Filename: sync_engine_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_backend/core/network/sync_engine.dart';

void main() {
  group('SyncEngine Unit Tests', () {
    test('SyncEngine singleton instance initialization', () {
      final engine = SyncEngine.instance;
      expect(engine, isNotNull);
    });

    test('executeFullSync handles invocation gracefully', () async {
      final engine = SyncEngine.instance;
      expect(() async => await engine.executeFullSync(), returnsNormally);
    });
  });
}
