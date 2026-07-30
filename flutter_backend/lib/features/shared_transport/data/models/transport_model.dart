// Folder Path: lib/features/shared_transport/data/models/
// Dart Filename: transport_model.dart

import '../../domain/entities/transport_entity.dart';

class TransportRouteModel extends TransportRouteEntity {
  TransportRouteModel({
    required super.id,
    required super.driverId,
    required super.vehicleCapacity,
    required super.availableCapacity,
    required super.routeFrom,
    required super.routeTo,
    required super.departureTime,
    required super.pricePerKg,
    required super.status,
    required super.lastModifiedAt,
  });

  factory TransportRouteModel.fromJson(Map<String, dynamic> json) {
    return TransportRouteModel(
      id: json['id'],
      driverId: json['driver_id'],
      vehicleCapacity: (json['vehicle_capacity'] as num).toDouble(),
      availableCapacity: (json['available_capacity'] as num).toDouble(),
      routeFrom: json['route_from'],
      routeTo: json['route_to'],
      departureTime: DateTime.parse(json['departure_time']),
      pricePerKg: (json['price_per_kg'] as num).toDouble(),
      status: json['status'],
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'driver_id': driverId,
      'vehicle_capacity': vehicleCapacity,
      'available_capacity': availableCapacity,
      'route_from': routeFrom,
      'route_to': routeTo,
      'departure_time': departureTime.toIso8601String(),
      'price_per_kg': pricePerKg,
      'status': status,
      'last_modified_at': lastModifiedAt.toIso8601String(),
    };
  }
}

class TransportBookingModel extends TransportBookingEntity {
  TransportBookingModel({
    required super.id,
    required super.routeId,
    required super.farmerId,
    required super.cargoWeight,
    required super.pickupAddress,
    required super.dropoffAddress,
    required super.totalFare,
    required super.status,
    required super.syncVersion,
    required super.lastModifiedAt,
    required super.isDeleted,
  });

  factory TransportBookingModel.fromJson(Map<String, dynamic> json) {
    return TransportBookingModel(
      id: json['id'],
      routeId: json['route_id'],
      farmerId: json['farmer_id'],
      cargoWeight: (json['cargo_weight'] as num).toDouble(),
      pickupAddress: json['pickup_address'],
      dropoffAddress: json['dropoff_address'],
      totalFare: (json['total_fare'] as num).toDouble(),
      status: json['status'],
      syncVersion: json['sync_version'] ?? 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
      isDeleted: json['is_deleted'] == true || json['is_deleted'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'route_id': routeId,
      'farmer_id': farmerId,
      'cargo_weight': cargoWeight,
      'pickup_address': pickupAddress,
      'dropoff_address': dropoffAddress,
      'total_fare': totalFare,
      'status': status,
      'sync_version': syncVersion,
      'last_modified_at': lastModifiedAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory TransportBookingModel.fromEntity(TransportBookingEntity entity) {
    return TransportBookingModel(
      id: entity.id,
      routeId: entity.routeId,
      farmerId: entity.farmerId,
      cargoWeight: entity.cargoWeight,
      pickupAddress: entity.pickupAddress,
      dropoffAddress: entity.dropoffAddress,
      totalFare: entity.totalFare,
      status: entity.status,
      syncVersion: entity.syncVersion,
      lastModifiedAt: entity.lastModifiedAt,
      isDeleted: entity.isDeleted,
    );
  }
}
