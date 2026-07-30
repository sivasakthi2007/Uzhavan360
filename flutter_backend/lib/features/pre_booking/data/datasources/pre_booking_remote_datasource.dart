// Folder Path: lib/features/pre_booking/data/datasources/
// Dart Filename: pre_booking_remote_datasource.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/pre_booking_model.dart';

class PreBookingRemoteDataSource {
  final SupabaseClient _client;
  PreBookingRemoteDataSource(this._client);

  Future<List<PreBookingModel>> fetchPreBookingsFromCloud() async {
    final response = await _client
        .from('harvest_pre_bookings')
        .select()
        .eq('is_deleted', false)
        .order('expected_harvest_date', ascending: true);
    
    final List<dynamic> data = response as List<dynamic>;
    return data.map((json) => PreBookingModel.fromJson(json)).toList();
  }

  Future<PreBookingModel> createPreBookingOnCloud(PreBookingModel model) async {
    final response = await _client
        .from('harvest_pre_bookings')
        .insert(model.toJson())
        .select()
        .single();
    
    return PreBookingModel.fromJson(response);
  }

  Future<void> updateStatusOnCloud(String id, String status) async {
    await _client
        .from('harvest_pre_bookings')
        .update({
          'status': status,
          'last_modified_at': DateTime.now().toUtc().toIso8601String(),
        })
        .eq('id', id);
  }
}
