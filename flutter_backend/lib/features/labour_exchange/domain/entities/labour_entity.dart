// Folder Path: lib/features/labour_exchange/domain/entities/
// Dart Filename: labour_entity.dart

class LabourWorkerEntity {
  final String id;
  final String workerId;
  final List<String> skills;
  final double dailyWageExpectation;
  final String preferredDistrict;
  final bool isAvailable;
  final DateTime lastModifiedAt;

  LabourWorkerEntity({
    required this.id,
    required this.workerId,
    required this.skills,
    required this.dailyWageExpectation,
    required this.preferredDistrict,
    required this.isAvailable,
    required this.lastModifiedAt,
  });
}

class LabourBookingEntity {
  final String id;
  final String employerId;
  final String workerId;
  final String jobTitle;
  final double wages;
  final DateTime startDate;
  final int durationDays;
  final String status;
  final int syncVersion;
  final DateTime lastModifiedAt;
  final bool isDeleted;

  LabourBookingEntity({
    required this.id,
    required this.employerId,
    required this.workerId,
    required this.jobTitle,
    required this.wages,
    required this.startDate,
    required this.durationDays,
    required this.status,
    required this.syncVersion,
    required this.lastModifiedAt,
    required this.isDeleted,
  });
}
