import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_backend/core/models/ooru_models.dart';
import 'package:flutter_backend/core/services/matching_engine.dart';

void main() {
  group('Ooru Connect Phase 1 Validation & Matching Engine Tests', () {
    test('1. Haversine Distance Calculation Test', () {
      // Vadugapalayam center
      final double lat1 = 11.0050;
      final double lon1 = 77.0300;

      // Point ~3.2 km away
      final double lat2 = 11.0250;
      final double lon2 = 77.0450;

      final double distance = MatchingEngine.calculateDistanceKm(lat1, lon1, lat2, lon2);
      expect(distance, greaterThan(2.0));
      expect(distance, lessThan(5.0));
    });

    test('2. Indian Phone Formatting Test (No Duplicate 91)', () {
      expect(MatchingEngine.formatIndianPhoneNumber('9842100111'), '919842100111');
      expect(MatchingEngine.formatIndianPhoneNumber('+919842100111'), '919842100111');
      expect(MatchingEngine.formatIndianPhoneNumber('919842100111'), '919842100111');
      expect(MatchingEngine.formatIndianPhoneNumber('09842100111'), '919842100111');
      expect(MatchingEngine.formatIndianPhoneNumber('98421 00111'), '919842100111');
    });

    test('3. 10-km Need Broadcast Matching Validation Scenario', () {
      final req = ServiceRequestModel(
        id: 'req_test_1',
        requesterId: 'user_1',
        requestType: 'labour_squad',
        skillName: 'Paddy Harvesting',
        requiredWorkers: 10,
        requiredDate: '2026-10-05',
        requiredTime: '7:00 AM',
        villageName: 'Vadugapalayam',
        createdAt: DateTime.now().toIso8601String(),
      );

      final providerA = ServiceProviderModel(
        id: 'p_a',
        profileId: 'prof_a',
        providerType: 'maistry',
        title: 'Maistry A (3 km - Available)',
        squadSize: 12,
        availabilityStatus: 'available_today',
        skills: ['Paddy Harvesting'],
        serviceRadiusKm: 5.0,
      );

      final providerB = ServiceProviderModel(
        id: 'p_b',
        profileId: 'prof_b',
        providerType: 'maistry',
        title: 'Maistry B (8 km - Available)',
        squadSize: 10,
        availabilityStatus: 'available_today',
        skills: ['Paddy Harvesting'],
        serviceRadiusKm: 10.0,
      );

      final providerC = ServiceProviderModel(
        id: 'p_c',
        profileId: 'prof_c',
        providerType: 'maistry',
        title: 'Maistry C (Booked)',
        squadSize: 15,
        availabilityStatus: 'booked', // Booked provider should be rejected
        skills: ['Paddy Harvesting'],
        serviceRadiusKm: 5.0,
      );

      final providerD = ServiceProviderModel(
        id: 'p_d',
        profileId: 'prof_d',
        providerType: 'maistry',
        title: 'Maistry D (Wrong Skill)',
        squadSize: 12,
        availabilityStatus: 'available_today',
        skills: ['Construction & Masonry'], // Wrong skill should be rejected
        serviceRadiusKm: 5.0,
      );

      final allProviders = [providerA, providerB, providerC, providerD];

      final matched = MatchingEngine.matchProviders(
        request: req,
        allProviders: allProviders,
        requestLat: 11.0050,
        requestLng: 77.0300,
      );

      // Verify Provider A and Provider B pass
      expect(matched.map((p) => p.id), containsAll(['p_a', 'p_b']));
      // Verify Provider C (booked) and Provider D (wrong skill) are rejected
      expect(matched.map((p) => p.id), isNot(contains('p_c')));
      expect(matched.map((p) => p.id), isNot(contains('p_d')));
    });

    test('4. Squad Capacity Requirement Test', () {
      final req = ServiceRequestModel(
        id: 'req_large',
        requesterId: 'user_2',
        requestType: 'labour_squad',
        skillName: 'Paddy Harvesting',
        requiredWorkers: 15, // Requires 15 workers
        requiredDate: '2026-10-05',
        requiredTime: '7:00 AM',
        createdAt: DateTime.now().toIso8601String(),
      );

      final smallSquadMaistry = ServiceProviderModel(
        id: 'p_small',
        profileId: 'prof_small',
        providerType: 'maistry',
        title: 'Small Squad Maistry (8 workers)',
        squadSize: 8, // Smaller than 15
        availabilityStatus: 'available_today',
        skills: ['Paddy Harvesting'],
      );

      final largeSquadMaistry = ServiceProviderModel(
        id: 'p_large',
        profileId: 'prof_large',
        providerType: 'maistry',
        title: 'Large Squad Maistry (20 workers)',
        squadSize: 20, // Sufficient capacity
        availabilityStatus: 'available_today',
        skills: ['Paddy Harvesting'],
      );

      final matched = MatchingEngine.matchProviders(
        request: req,
        allProviders: [smallSquadMaistry, largeSquadMaistry],
      );

      expect(matched.length, equals(1));
      expect(matched.first.id, equals('p_large'));
    });
  });
}
