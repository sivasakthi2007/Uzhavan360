// Folder Path: lib/features/pre_booking/domain/entities/
// Dart Filename: pre_booking_entity.dart

class PreBookingEntity {
  final String id;
  final String farmerId;
  final String? buyerId;
  final String cropName;
  final double estimatedQuantity;
  final String unit;
  final double agreedPricePerUnit;
  final double escrowDeposit;
  final DateTime expectedHarvestDate;
  final String status;
  final int syncVersion;
  final DateTime lastModifiedAt;
  final bool isDeleted;

  PreBookingEntity({
    required this.id,
    required this.farmerId,
    this.buyerId,
    required this.cropName,
    required this.estimatedQuantity,
    required this.unit,
    required this.agreedPricePerUnit,
    required this.escrowDeposit,
    required this.expectedHarvestDate,
    required this.status,
    required this.syncVersion,
    required this.lastModifiedAt,
    required this.isDeleted,
  });

  PreBookingEntity copyWith({
    String? id,
    String? farmerId,
    String? buyerId,
    String? cropName,
    double? estimatedQuantity,
    String? unit,
    double? agreedPricePerUnit,
    double? escrowDeposit,
    DateTime? expectedHarvestDate,
    String? status,
    int? syncVersion,
    DateTime? lastModifiedAt,
    bool? isDeleted,
  }) {
    return PreBookingEntity(
      id: id ?? this.id,
      farmerId: farmerId ?? this.farmerId,
      buyerId: buyerId ?? this.buyerId,
      cropName: cropName ?? this.cropName,
      estimatedQuantity: estimatedQuantity ?? this.estimatedQuantity,
      unit: unit ?? this.unit,
      agreedPricePerUnit: agreedPricePerUnit ?? this.agreedPricePerUnit,
      escrowDeposit: escrowDeposit ?? this.escrowDeposit,
      expectedHarvestDate: expectedHarvestDate ?? this.expectedHarvestDate,
      status: status ?? this.status,
      syncVersion: syncVersion ?? this.syncVersion,
      lastModifiedAt: lastModifiedAt ?? this.lastModifiedAt,
      isDeleted: isDeleted ?? this.isDeleted,
    );
  }
}
