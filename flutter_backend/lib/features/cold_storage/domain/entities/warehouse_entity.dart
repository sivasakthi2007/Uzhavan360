// Folder Path: lib/features/cold_storage/domain/entities/
// Dart Filename: warehouse_entity.dart

class WarehouseEntity {
  final String id;
  final String name;
  final String location;
  final String district;
  final double totalCapacity;
  final double availableCapacity;
  final double pricePerUnitDaily;
  final bool hasColdStorage;
  final DateTime lastModifiedAt;

  WarehouseEntity({
    required this.id,
    required this.name,
    required this.location,
    required this.district,
    required this.totalCapacity,
    required this.availableCapacity,
    required this.pricePerUnitDaily,
    required this.hasColdStorage,
    required this.lastModifiedAt,
  });
}

class WarehouseBookingEntity {
  final String id;
  final String warehouseId;
  final String farmerId;
  final String commodityName;
  final double quantity;
  final DateTime startDate;
  final DateTime endDate;
  final double totalCost;
  final String status;
  final int syncVersion;
  final DateTime lastModifiedAt;
  final bool isDeleted;

  WarehouseBookingEntity({
    required this.id,
    required this.warehouseId,
    required this.farmerId,
    required this.commodityName,
    required this.quantity,
    required this.startDate,
    required this.endDate,
    required this.totalCost,
    required this.status,
    required this.syncVersion,
    required this.lastModifiedAt,
    required this.isDeleted,
  });
}
