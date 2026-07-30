// Folder Path: lib/core/storage/
// Dart Filename: database_helper.dart

import 'dart:convert';
import 'package:sqflite_sqlcipher/sqflite.dart';
import 'package:path/path.dart';
import 'secure_storage_service.dart';

class DatabaseHelper {
  final SecureStorageService _secureStorage;
  DatabaseHelper(this._secureStorage);

  static const String _dbName = 'uzhavan360_v2.db';
  static const int _dbVersion = 1;
  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, _dbName);

    // Retrieve or generate database encryption password key
    String? pass = await _secureStorage.read('sqlite_cipher_key');
    if (pass == null) {
      // 256-bit Hex Key
      pass = List.generate(32, (index) => DateTime.now().microsecondsSinceEpoch.toRadixString(16)).join().substring(0, 64);
      await _secureStorage.write('sqlite_cipher_key', pass);
    }

    return await openDatabase(
      path,
      version: _dbVersion,
      password: pass,
      onCreate: (db, version) async {
        // Core offline synchronization transaction queue
        await db.execute('''
          CREATE TABLE pending_sync_queue (
            id TEXT PRIMARY KEY,
            table_name TEXT NOT NULL,
            action TEXT NOT NULL,
            record_id TEXT NOT NULL,
            payload TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            attempts INTEGER DEFAULT 0
          )
        ''');

        // V2.0 Harvest Pre-Bookings table local cache
        await db.execute('''
          CREATE TABLE local_harvest_pre_bookings (
            id TEXT PRIMARY KEY,
            farmer_id TEXT NOT NULL,
            buyer_id TEXT,
            crop_name TEXT NOT NULL,
            estimated_quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            agreed_price_per_unit REAL NOT NULL,
            escrow_deposit REAL DEFAULT 0,
            expected_harvest_date TEXT NOT NULL,
            status TEXT NOT NULL,
            sync_version INTEGER DEFAULT 1,
            last_modified_at TEXT NOT NULL,
            is_deleted INTEGER DEFAULT 0,
            is_dirty INTEGER DEFAULT 0
          )
        ''');
      },
    );
  }
}
