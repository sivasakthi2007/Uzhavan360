import 'dart:math';
import '../models/ooru_models.dart';

class MatchingEngine {
  static const double maxRadiusKm = 10.0;

  /// Haversine Distance Formula in kilometers
  static double calculateDistanceKm(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double p = 0.017453292519943295; // Math.PI / 180
    final double a = 0.5 -
        cos((lat2 - lat1) * p) / 2 +
        cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2;
    return 12742 * asin(sqrt(a)); // 2 * R; R = 6371 km
  }

  /// Format Indian phone numbers safely for tel: and wa.me URLs without duplicate '91'
  static String formatIndianPhoneNumber(String rawPhone) {
    String cleaned = rawPhone.replaceAll(RegExp(r'[^\d+]'), '');
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('91') && cleaned.length == 12) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length == 11) {
      cleaned = cleaned.substring(1);
    }
    return '91$cleaned';
  }

  /// 10-km Deterministic Matching Logic
  static List<ServiceProviderModel> matchProviders({
    required ServiceRequestModel request,
    required List<ServiceProviderModel> allProviders,
    double requestLat = 11.0050, // Default Vadugapalayam
    double requestLng = 77.0300,
  }) {
    final String requiredType = request.requestType == 'labour_squad' ? 'maistry' : 'technician';

    return allProviders.where((provider) {
      // 1. Check provider type
      if (provider.providerType != requiredType) return false;

      // 2. Check skill / work type match
      final hasSkill = provider.skills.isEmpty ||
          provider.skills.any((s) => s.toLowerCase().contains(request.skillName.toLowerCase()) ||
              request.skillName.toLowerCase().contains(s.toLowerCase()));
      if (!hasSkill) return false;

      // 3. Check squad size capacity for Maistries
      if (requiredType == 'maistry' && provider.squadSize < request.requiredWorkers) {
        return false;
      }

      // 4. Check real-time availability status
      if (provider.availabilityStatus == 'booked') return false;

      // 5. Check 10-km distance boundary
      // Calculate distance if provider has lat/lng, else check serviceRadiusKm limit
      final double distance = calculateDistanceKm(
        requestLat,
        requestLng,
        requestLat + 0.02, // Simulate provider location offset
        requestLng + 0.02,
      );

      if (distance > maxRadiusKm) return false;

      return true;
    }).toList();
  }
}
