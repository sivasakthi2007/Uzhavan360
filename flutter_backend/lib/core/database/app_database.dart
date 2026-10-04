import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite_sqlcipher/sqflite.dart';
import '../models/ooru_models.dart';

class AppDatabase {
  static final AppDatabase instance = AppDatabase._init();
  static Database? _database;

  AppDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('ooru_connect_local.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE offline_outbox (
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        sync_state TEXT DEFAULT 'PENDING'
      )
    ''');

    await db.execute('''
      CREATE TABLE cached_requests (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        request_type TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        required_workers INTEGER,
        required_date TEXT NOT NULL,
        required_time TEXT NOT NULL,
        village_name TEXT,
        duration TEXT,
        budget_offered TEXT,
        problem_details TEXT,
        urgency TEXT,
        status TEXT,
        created_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE cached_providers (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        title TEXT NOT NULL,
        experience_years INTEGER,
        service_radius_km REAL,
        base_rate TEXT,
        is_phone_verified INTEGER,
        squad_size INTEGER,
        availability_status TEXT,
        available_date TEXT,
        village_name TEXT,
        phone TEXT,
        vouches_count INTEGER
      )
    ''');

    await db.execute('''
      CREATE TABLE cached_villages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        district TEXT NOT NULL,
        latitude REAL,
        longitude REAL
      )
    ''');
  }

  // --- Outbox Queue Operations ---
  Future<int> insertOutbox(OutboxItemModel item) async {
    final db = await instance.database;
    return await db.insert('offline_outbox', item.toMap());
  }

  Future<List<OutboxItemModel>> getPendingOutboxItems() async {
    final db = await instance.database;
    final maps = await db.query(
      'offline_outbox',
      where: 'sync_state = ? OR sync_state = ?',
      whereArgs: ['PENDING', 'FAILED'],
      orderBy: 'local_id ASC',
    );
    return maps.map((m) => OutboxItemModel.fromMap(m)).toList();
  }

  Future<int> updateOutboxState(int localId, String syncState, {int? retryCount}) async {
    final db = await instance.database;
    final map = <String, dynamic>{'sync_state': syncState};
    if (retryCount != null) map['retry_count'] = retryCount;

    return await db.update(
      'offline_outbox',
      map,
      where: 'local_id = ?',
      whereArgs: [localId],
    );
  }

  Future<int> deleteOutboxItem(int localId) async {
    final db = await instance.database;
    return await db.delete(
      'offline_outbox',
      where: 'local_id = ?',
      whereArgs: [localId],
    );
  }

  // --- Cached Requests Operations ---
  Future<void> cacheRequests(List<ServiceRequestModel> requests) async {
    final db = await instance.database;
    final batch = db.batch();
    for (var r in requests) {
      batch.insert('cached_requests', r.toJson(), conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<ServiceRequestModel>> getCachedRequests() async {
    final db = await instance.database;
    final maps = await db.query('cached_requests', orderBy: 'created_at DESC');
    return maps.map((m) => ServiceRequestModel.fromJson(m)).toList();
  }

  // --- Cached Providers Operations ---
  Future<void> cacheProviders(List<ServiceProviderModel> providers) async {
    final db = await instance.database;
    final batch = db.batch();
    for (var p in providers) {
      batch.insert('cached_providers', p.toJson(), conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<ServiceProviderModel>> getCachedProviders() async {
    final db = await instance.database;
    final maps = await db.query('cached_providers');
    return maps.map((m) => ServiceProviderModel.fromJson(m)).toList();
  }

  // --- Cached Villages Operations ---
  Future<void> cacheVillages(List<VillageModel> villages) async {
    final db = await instance.database;
    final batch = db.batch();
    for (var v in villages) {
      batch.insert('cached_villages', v.toJson(), conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<VillageModel>> getCachedVillages() async {
    final db = await instance.database;
    final maps = await db.query('cached_villages');
    return maps.map((m) => VillageModel.fromJson(m)).toList();
  }
}
