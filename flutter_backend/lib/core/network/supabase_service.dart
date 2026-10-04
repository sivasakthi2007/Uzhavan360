import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/ooru_models.dart';
import '../database/app_database.dart';

class SupabaseService {
  static final SupabaseService instance = SupabaseService._internal();
  SupabaseService._internal();

  SupabaseClient get _client => Supabase.instance.client;

  // --- Seed Demo Data for Offline/Sandbox Mode ---
  static List<VillageModel> get seedVillages => [
    VillageModel(id: 'v1', name: 'Vadugapalayam', district: 'Coimbatore', latitude: 11.0050, longitude: 77.0300),
    VillageModel(id: 'v2', name: 'Pollachi Rural', district: 'Coimbatore', latitude: 10.6600, longitude: 77.0100),
    VillageModel(id: 'v3', name: 'Kinathukadavu', district: 'Coimbatore', latitude: 10.8200, longitude: 77.0200),
    VillageModel(id: 'v4', name: 'Sulur', district: 'Coimbatore', latitude: 11.0280, longitude: 77.1260),
    VillageModel(id: 'v5', name: 'Thondamuthur', district: 'Coimbatore', latitude: 10.9930, longitude: 76.8340),
  ];

  static List<ServiceProviderModel> get seedProviders => [
    ServiceProviderModel(
      id: 'p1',
      profileId: 'prof1',
      providerType: 'maistry',
      title: 'ரவி மேஸ்திரி (Ravi Harvesting Squad)',
      squadSize: 12,
      baseRate: '₹850 / person / day',
      villageName: 'Vadugapalayam',
      phone: '9842100111',
      availabilityStatus: 'available_today',
      vouchesCount: 8,
      skills: ['Paddy Harvesting', 'Loading & Unloading'],
      serviceRadiusKm: 10.0,
    ),
    ServiceProviderModel(
      id: 'p2',
      profileId: 'prof2',
      providerType: 'maistry',
      title: 'செல்வம் மேஸ்திரி (Selvam Weeding Crew)',
      squadSize: 8,
      baseRate: '₹700 / person / day',
      villageName: 'Kinathukadavu',
      phone: '9842100222',
      availabilityStatus: 'available_today',
      vouchesCount: 5,
      skills: ['Planting & Weeding'],
      serviceRadiusKm: 8.0,
    ),
    ServiceProviderModel(
      id: 'p3',
      profileId: 'prof3',
      providerType: 'technician',
      title: 'குமார் மோட்டார் ஒர்க்ஸ் (Kumar Motor Works)',
      experienceYears: 14,
      baseRate: '₹350 visiting fee',
      villageName: 'Pollachi Rural',
      phone: '9842100333',
      availabilityStatus: 'available_today',
      vouchesCount: 12,
      skills: ['Motor & Pump Mechanic', 'Electrician & Wiring'],
      serviceRadiusKm: 12.0,
    ),
    ServiceProviderModel(
      id: 'p4',
      profileId: 'prof4',
      providerType: 'technician',
      title: 'முருகன் JCB Service (Murugan JCB)',
      experienceYears: 9,
      baseRate: '₹1200 / hour',
      villageName: 'Sulur',
      phone: '9842100444',
      availabilityStatus: 'available_today',
      vouchesCount: 6,
      skills: ['JCB & Earthmover Operator', 'Tractor Operator'],
      serviceRadiusKm: 15.0,
    ),
    ServiceProviderModel(
      id: 'p5',
      profileId: 'prof5',
      providerType: 'technician',
      title: 'மாரி தென்னை ஏறுபவர் (Mari Coconut Climber)',
      experienceYears: 7,
      baseRate: '₹40 / tree',
      villageName: 'Thondamuthur',
      phone: '9842100555',
      availabilityStatus: 'booked',
      availableDate: '2026-10-06',
      vouchesCount: 9,
      skills: ['Tree Cutter & Coconut Climber'],
      serviceRadiusKm: 6.0,
    ),
  ];

  // --- Remote Queries with Local Fallback ---
  Future<List<VillageModel>> getVillages() async {
    try {
      final res = await _client.from('villages').select();
      if (res != null && (res as List).isNotEmpty) {
        final list = (res as List).map((x) => VillageModel.fromJson(x)).toList();
        await AppDatabase.instance.cacheVillages(list);
        return list;
      }
    } catch (e) {
      debugPrint('Supabase getVillages error, fallback to local: $e');
    }
    final cached = await AppDatabase.instance.getCachedVillages();
    if (cached.isNotEmpty) return cached;
    await AppDatabase.instance.cacheVillages(seedVillages);
    return seedVillages;
  }

  Future<List<ServiceProviderModel>> getMatchingProviders({
    required String requestType,
    required String skillName,
    int requiredWorkers = 1,
    double maxRadiusKm = 10.0,
  }) async {
    try {
      final res = await _client.from('service_providers').select();
      if (res != null && (res as List).isNotEmpty) {
        final list = (res as List).map((x) => ServiceProviderModel.fromJson(x)).toList();
        await AppDatabase.instance.cacheProviders(list);
        return _filterProviders(list, requestType, skillName, requiredWorkers);
      }
    } catch (e) {
      debugPrint('Supabase getMatchingProviders error, fallback to local: $e');
    }
    final cached = await AppDatabase.instance.getCachedProviders();
    final all = cached.isNotEmpty ? cached : seedProviders;
    return _filterProviders(all, requestType, skillName, requiredWorkers);
  }

  List<ServiceProviderModel> _filterProviders(
    List<ServiceProviderModel> list,
    String requestType,
    String skillName,
    int requiredWorkers,
  ) {
    final typeFilter = requestType == 'labour_squad' ? 'maistry' : 'technician';
    return list.where((p) {
      if (p.providerType != typeFilter) return false;
      if (typeFilter == 'maistry' && p.squadSize < requiredWorkers) return false;
      return true;
    }).toList();
  }

  Future<bool> createServiceRequest(ServiceRequestModel req) async {
    try {
      await _client.from('service_requests').insert(req.toJson());
      return true;
    } catch (e) {
      debugPrint('Supabase createServiceRequest failed, queueing offline outbox: $e');
      await AppDatabase.instance.insertOutbox(
        OutboxItemModel(
          operation: 'CREATE_REQUEST',
          payloadJson: jsonEncode(req.toJson()),
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
      // Cache locally so it appears in My Requests immediately
      await AppDatabase.instance.cacheRequests([req]);
      return false;
    }
  }

  Future<bool> updateProviderAvailability(String providerId, String newStatus, {String? availableDate}) async {
    try {
      await _client.from('provider_availabilities').upsert({
        'provider_id': providerId,
        'status': newStatus,
        'available_date': availableDate,
        'updated_at': DateTime.now().toIso8601String(),
      });
      return true;
    } catch (e) {
      debugPrint('Supabase updateProviderAvailability failed, queueing outbox: $e');
      await AppDatabase.instance.insertOutbox(
        OutboxItemModel(
          operation: 'UPDATE_AVAILABILITY',
          payloadJson: jsonEncode({
            'provider_id': providerId,
            'status': newStatus,
            'available_date': availableDate,
          }),
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
      return false;
    }
  }

  Future<bool> addVouch(VouchModel vouch) async {
    try {
      await _client.from('vouches').insert(vouch.toJson());
      return true;
    } catch (e) {
      debugPrint('Supabase addVouch failed, queueing outbox: $e');
      await AppDatabase.instance.insertOutbox(
        OutboxItemModel(
          operation: 'CREATE_VOUCH',
          payloadJson: jsonEncode(vouch.toJson()),
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
      return false;
    }
  }

  Future<bool> submitReport(String reporterId, String targetId, String reason, String details) async {
    try {
      await _client.from('reports').insert({
        'reporter_id': reporterId,
        'target_profile_id': targetId,
        'reason': reason,
        'details': details,
        'created_at': DateTime.now().toIso8601String(),
      });
      return true;
    } catch (e) {
      debugPrint('Submit report error: $e');
      return false;
    }
  }
}
