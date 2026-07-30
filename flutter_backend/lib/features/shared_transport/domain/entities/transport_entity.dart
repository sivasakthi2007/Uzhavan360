// Folder Path: lib/features/shared_transport/domain/entities/
// Dart Filename: transport_entity.dart

class TransportRouteEntity {
  final String id;
  final String driverId;
  final double vehicleCapacity;
  final double availableCapacity;
  final String routeFrom;
  final String routeTo;
  final DateTime departureTime;
  final double pricePerKg;
  final String status;
  final DateTime lastModifiedAt;

  TransportRouteEntity({
    required this.id,
    required this.driverId,
    required this.vehicleCapacity,
    required this.availableCapacity,
    required this.routeFrom,
    required this.routeTo,
    required this.departureTime,
    required this.pricePerKg,
    required this.status,
    required this.lastModifiedAt,
  });
}

class TransportBookingEntity {
  final String id;
  final String routeId;
  final String farmerId;
  final double cargoWeight;
  final String pickupAddress;
  final String dropoffAddress;
  final double totalFare;
  final String status;
  final int syncVersion;
  final DateTime lastModifiedAt;
  final bool isDeleted;

  TransportBookingEntity({
    required this.id,
    required this.routeId,
    required this.farmerId,
    required this.cargoWeight,
    required this.pickupAddress,
    required this.dropoffAddress,
    required this.totalFare,
    required this.status,
    required this.syncVersion,
    required this.lastModifiedAt,
    required this.isDeleted,
  });
}
