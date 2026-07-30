// Folder Path: lib/core/network/
// Dart Filename: sync_queue_manager.dart

import 'dart:convert';
import 'package:sqflite_sqlcipher/sqflite.dart';
import '../storage/database_helper.dart';

class SyncQueueItem {
  final String id;
  final String tableName;
  final String action;
  final String recordId;
  final Map<String, dynamic> payload;
  final DateTime timestamp;
  final int attempts;

  SyncQueueItem({
    required this.id,
    required this.tableName,
    required this.action,
    required this.recordId,
    required this.payload,
    required this.timestamp,
    required this.attempts,
  });

  factory SyncQueueItem.fromMap(Map<String, dynamic> map) {
    return SyncQueueItem(
      id: map['id'],
      tableName: map['table_name'],
      action: map['action'],
      recordId: map['record_id'],
      payload: jsonDecode(map['payload']),
      timestamp: DateTime.parse(map['timestamp']),
      attempts: map['attempts'],
    );
  }
}

class SyncQueueManager {
  final DatabaseHelper _dbHelper;
  SyncQueueManager(this._dbHelper);

  Future<void> enqueue({
    required String tableName,
    required String action,
    required String recordId,
    required Map<String, dynamic> payload,
  }) async {
    final db = await _dbHelper.database;
    await db.insert(
      'pending_sync_queue',
      {
        'id': '${tableName}_${recordId}_${DateTime.now().microsecondsSinceEpoch}',
        'table_name': tableName,
        'action': action,
        'record_id': recordId,
        'payload': jsonEncode(payload),
        'timestamp': DateTime.now().toUtc().toIso8601String(),
        'attempts': 0,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<SyncQueueItem>> getQueue() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'pending_sync_queue',
      orderBy: 'timestamp ASC',
    );
    return maps.map((m) => SyncQueueItem.fromMap(m)).toList();
  }

  Future<void> incrementAttempts(String id) async {
    final db = await _dbHelper.database;
    await db.rawUpdate(
      'UPDATE pending_sync_queue SET attempts = attempts + 1 WHERE id = ?',
      [id],
    );
  }

  Future<void> dequeue(String id) async {
    final db = await _dbHelper.database;
    await db.delete(
      'pending_sync_queue',
      where: 'id = ?',
      whereArgs: [id],
    );
  }
}
