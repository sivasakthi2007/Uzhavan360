// Folder Path: lib/features/labour_exchange/data/models/
// Dart Filename: labour_model.dart

import 'dart:convert';
import '../../domain/entities/labour_entity.dart';

class LabourWorkerModel extends LabourWorkerEntity {
  LabourWorkerModel({
    required super.id,
    required super.workerId,
    required super.skills,
    required super.dailyWageExpectation,
    required super.preferredDistrict,
    required super.isAvailable,
    required super.lastModifiedAt,
  });

  factory LabourWorkerModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedSkills = [];
    if (json['skills'] is String) {
      parsedSkills = List<String>.from(jsonDecode(json['skills']));
    } else if (json['skills'] is List) {
      parsedSkills = List<String>.from(json['skills']);
    }
    return LabourWorkerModel(
      id: json['id'],
      workerId: json['worker_id'],
      skills: parsedSkills,
      dailyWageExpectation: (json['daily_wage_expectation'] as num).toDouble(),
      preferredDistrict: json['preferred_district'],
      isAvailable: json['is_available'] == true || json['is_available'] == 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'worker_id': workerId,
      'skills': jsonEncode(skills), // Serializes array to JSON string for SQLite/PG mapping compatibility
      'daily_wage_expectation': dailyWageExpectation,
      'preferred_district': preferredDistrict,
      'is_available': isAvailable ? 1 : 0,
      'last_modified_at': lastModifiedAt.toIso8601String(),
    };
  }
}

class LabourBookingModel extends LabourBookingEntity {
  LabourBookingModel({
    required super.id,
    required super.employerId,
    required super.workerId,
    required super.jobTitle,
    required super.wages,
    required super.startDate,
    required super.durationDays,
    required super.status,
    required super.syncVersion,
    required super.lastModifiedAt,
    required super.isDeleted,
  });

  factory LabourBookingModel.fromJson(Map<String, dynamic> json) {
    return LabourBookingModel(
      id: json['id'],
      employerId: json['employer_id'],
      workerId: json['worker_id'],
      jobTitle: json['job_title'],
      wages: (json['wages'] as num).toDouble(),
      startDate: DateTime.parse(json['start_date']),
      durationDays: json['duration_days'] ?? 1,
      status: json['status'],
      syncVersion: json['sync_version'] ?? 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
      isDeleted: json['is_deleted'] == true || json['is_deleted'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employer_id': employerId,
      'worker_id': workerId,
      'job_title': jobTitle,
      'wages': wages,
      'start_date': startDate.toIso8601String().substring(0, 10),
      'status': status,
      'sync_version': syncVersion,
      'last_modified_at': lastModifiedAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory LabourBookingModel.fromEntity(LabourBookingEntity entity) {
    return LabourBookingModel(
      id: entity.id,
      employerId: entity.employerId,
      workerId: entity.workerId,
      jobTitle: entity.jobTitle,
      wages: entity.wages,
      startDate: entity.startDate,
      durationDays: entity.durationDays,
      status: entity.status,
      syncVersion: entity.syncVersion,
      lastModifiedAt: entity.lastModifiedAt,
      isDeleted: entity.isDeleted,
    );
  }
}
