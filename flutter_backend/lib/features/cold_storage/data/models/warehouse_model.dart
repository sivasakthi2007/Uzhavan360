// Folder Path: lib/features/cold_storage/data/models/
// Dart Filename: warehouse_model.dart

import '../../domain/entities/warehouse_entity.dart';

class WarehouseModel extends WarehouseEntity {
  WarehouseModel({
    required super.id,
    required super.name,
    required super.location,
    required super.district,
    required super.totalCapacity,
    required super.availableCapacity,
    required super.pricePerUnitDaily,
    required super.hasColdStorage,
    required super.lastModifiedAt,
  });

  factory WarehouseModel.fromJson(Map<String, dynamic> json) {
    return WarehouseModel(
      id: json['id'],
      name: json['name'],
      location: json['location'],
      district: json['district'],
      totalCapacity: (json['total_capacity'] as num).toDouble(),
      availableCapacity: (json['available_capacity'] as num).toDouble(),
      pricePerUnitDaily: (json['price_per_unit_daily'] as num).toDouble(),
      hasColdStorage: json['has_cold_storage'] == true || json['has_cold_storage'] == 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'location': location,
      'district': district,
      'total_capacity': totalCapacity,
      'available_capacity': availableCapacity,
      'price_per_unit_daily': pricePerUnitDaily,
      'has_cold_storage': hasColdStorage ? 1 : 0,
      'last_modified_at': lastModifiedAt.toIso8601String(),
    };
  }
}

class WarehouseBookingModel extends WarehouseBookingEntity {
  WarehouseBookingModel({
    required super.id,
    required super.warehouseId,
    required super.farmerId,
    required super.commodityName,
    required super.quantity,
    required super.startDate,
    required super.endDate,
    required super.totalCost,
    required super.status,
    required super.syncVersion,
    required super.lastModifiedAt,
    required super.isDeleted,
  });

  factory WarehouseBookingModel.fromJson(Map<String, dynamic> json) {
    return WarehouseBookingModel(
      id: json['id'],
      warehouseId: json['warehouse_id'],
      farmerId: json['farmer_id'],
      commodityName: json['commodity_name'],
      quantity: (json['quantity'] as num).toDouble(),
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      totalCost: (json['total_cost'] as num).toDouble(),
      status: json['status'],
      syncVersion: json['sync_version'] ?? 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
      isDeleted: json['is_deleted'] == true || json['is_deleted'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'warehouse_id': warehouseId,
      'farmer_id': farmerId,
      'commodity_name': commodityName,
      'quantity': quantity,
      'start_date': startDate.toIso8601String().substring(0, 10),
      'end_date': endDate.toIso8601String().substring(0, 10),
      'total_cost': totalCost,
      'status': status,
      'sync_version': syncVersion,
      'last_modified_at': lastModifiedAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory WarehouseBookingModel.fromEntity(WarehouseBookingEntity entity) {
    return WarehouseBookingModel(
      id: entity.id,
      warehouseId: entity.warehouseId,
      farmerId: entity.farmerId,
      commodityName: entity.commodityName,
      quantity: entity.quantity,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalCost: entity.totalCost,
      status: entity.status,
      syncVersion: entity.syncVersion,
      lastModifiedAt: entity.lastModifiedAt,
      isDeleted: entity.isDeleted,
    );
  }
}
