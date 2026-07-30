// Folder Path: lib/features/pre_booking/data/models/
// Dart Filename: pre_booking_model.dart

import '../../domain/entities/pre_booking_entity.dart';

class PreBookingModel extends PreBookingEntity {
  PreBookingModel({
    required super.id,
    required super.farmerId,
    super.buyerId,
    required super.cropName,
    required super.estimatedQuantity,
    required super.unit,
    required super.agreedPricePerUnit,
    required super.escrowDeposit,
    required super.expectedHarvestDate,
    required super.status,
    required super.syncVersion,
    required super.lastModifiedAt,
    required super.isDeleted,
  });

  factory PreBookingModel.fromJson(Map<String, dynamic> json) {
    return PreBookingModel(
      id: json['id'],
      farmerId: json['farmer_id'],
      buyerId: json['buyer_id'],
      cropName: json['crop_name'],
      estimatedQuantity: (json['estimated_quantity'] as num).toDouble(),
      unit: json['unit'] ?? 'kg',
      agreedPricePerUnit: (json['agreed_price_per_unit'] as num).toDouble(),
      escrowDeposit: (json['escrow_deposit'] as num?)?.toDouble() ?? 0.0,
      expectedHarvestDate: DateTime.parse(json['expected_harvest_date']),
      status: json['status'],
      syncVersion: json['sync_version'] ?? 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
      isDeleted: json['is_deleted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'farmer_id': farmerId,
      'buyer_id': buyerId,
      'crop_name': cropName,
      'estimated_quantity': estimatedQuantity,
      'unit': unit,
      'agreed_price_per_unit': agreedPricePerUnit,
      'escrow_deposit': escrowDeposit,
      'expected_harvest_date': expectedHarvestDate.toIso8601String().substring(0, 10),
      'status': status,
      'sync_version': syncVersion,
      'last_modified_at': lastModifiedAt.toIso8601String(),
      'is_deleted': isDeleted,
    };
  }

  factory PreBookingModel.fromEntity(PreBookingEntity entity) {
    return PreBookingModel(
      id: entity.id,
      farmerId: entity.farmerId,
      buyerId: entity.buyerId,
      cropName: entity.cropName,
      estimatedQuantity: entity.estimatedQuantity,
      unit: entity.unit,
      agreedPricePerUnit: entity.agreedPricePerUnit,
      escrowDeposit: entity.escrowDeposit,
      expectedHarvestDate: entity.expectedHarvestDate,
      status: entity.status,
      syncVersion: entity.syncVersion,
      lastModifiedAt: entity.lastModifiedAt,
      isDeleted: entity.isDeleted,
    );
  }
}
