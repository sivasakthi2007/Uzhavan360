// Folder Path: lib/features/pre_booking/data/datasources/
// Dart Filename: pre_booking_local_datasource.dart

import 'package:sqflite_sqlcipher/sqflite.dart';
import '../../../../core/storage/database_helper.dart';
import '../models/pre_booking_model.dart';

class PreBookingLocalDataSource {
  final DatabaseHelper _dbHelper;
  PreBookingLocalDataSource(this._dbHelper);

  Future<void> cachePreBooking(PreBookingModel model, {required bool isDirty}) async {
    final db = await _dbHelper.database;
    final map = model.toJson();
    map['is_dirty'] = isDirty ? 1 : 0;
    map['is_deleted'] = model.isDeleted ? 1 : 0;

    await db.insert(
      'local_harvest_pre_bookings',
      map,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<PreBookingModel>> getCachedPreBookings() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'local_harvest_pre_bookings',
      where: 'is_deleted = 0',
      orderBy: 'expected_harvest_date ASC',
    );
    return maps.map((m) => PreBookingModel.fromJson(m)).toList();
  }

  Future<void> updateStatusInCache(String id, String status) async {
    final db = await _dbHelper.database;
    await db.rawUpdate(
      'UPDATE local_harvest_pre_bookings SET status = ?, is_dirty = 1, last_modified_at = ? WHERE id = ?',
      [status, DateTime.now().toUtc().toIso8601String(), id],
    );
  }

  Future<void> clearCache() async {
    final db = await _dbHelper.database;
    await db.delete('local_harvest_pre_bookings');
  }
}
