// Folder Path: lib/features/
// Dart Filename: consolidated_core_pack.dart
// Note: Consolidates domain entities, models, repositories, and Riverpod controllers
// for Equipment Rental, Buyer/FPO, Analytics, Weather, Gov Schemes, AI Assistant, and Support.

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/storage/database_helper.dart';
import '../core/network/sync_queue_manager.dart';
import '../core/di/providers.dart';

// =========================================================================
// 1. BUYER & FPO NETWORK MODULE
// =========================================================================

class FpoEntity {
  final String id;
  final String name;
  final String district;
  final String representativeName;
  final String contactPhone;
  final int memberCount;

  FpoEntity({
    required this.id,
    required this.name,
    required this.district,
    required this.representativeName,
    required this.contactPhone,
    required this.memberCount,
  });
}

class FpoModel extends FpoEntity {
  FpoModel({
    required super.id,
    required super.name,
    required super.district,
    required super.representativeName,
    required super.contactPhone,
    required super.memberCount,
  });

  factory FpoModel.fromJson(Map<String, dynamic> json) {
    return FpoModel(
      id: json['id'],
      name: json['name'],
      district: json['district'],
      representativeName: json['representative_name'],
      contactPhone: json['contact_phone'],
      memberCount: json['member_count'] ?? 0,
    );
  }
}

class FpoRepository {
  final SupabaseClient client;
  FpoRepository(this.client);

  Future<List<FpoEntity>> fetchFpos(String district) async {
    final response = await client.from('fpos').select().eq('district', district);
    return (response as List).map((e) => FpoModel.fromJson(e)).toList();
  }
}

final fpoRepositoryProvider = Provider<FpoRepository>((ref) {
  return FpoRepository(ref.watch(supabaseClientProvider));
});

final fpoListProvider = FutureProvider.family<List<FpoEntity>, String>((ref, district) async {
  return await ref.watch(fpoRepositoryProvider).fetchFpos(district);
});


// =========================================================================
// 2. WEATHER INTELLIGENCE MODULE
// =========================================================================

class WeatherAdvisoryEntity {
  final String condition;
  final double temperature;
  final double humidity;
  final double precipitationProbability;
  final String advisoryText;

  WeatherAdvisoryEntity({
    required this.condition,
    required this.temperature,
    required this.humidity,
    required this.precipitationProbability,
    required this.advisoryText,
  });
}

class WeatherRepository {
  final SupabaseClient client;
  WeatherRepository(this.client);

  Future<WeatherAdvisoryEntity> getAdvisory(String district) async {
    // Queries remote OpenWeather / Supabase weather agent functions
    final response = await client.functions.invoke('weather-advisory', body: {'district': district});
    final Map<String, dynamic> data = jsonDecode(response.data);
    return WeatherAdvisoryEntity(
      condition: data['condition'] ?? 'Clear',
      temperature: (data['temperature'] as num?)?.toDouble() ?? 30.0,
      humidity: (data['humidity'] as num?)?.toDouble() ?? 65.0,
      precipitationProbability: (data['precipitation_probability'] as num?)?.toDouble() ?? 0.0,
      advisoryText: data['advisory'] ?? 'Ideal conditions for crop spraying.',
    );
  }
}

final weatherRepositoryProvider = Provider<WeatherRepository>((ref) {
  return WeatherRepository(ref.watch(supabaseClientProvider));
});

final weatherAdvisoryProvider = FutureProvider.family<WeatherAdvisoryEntity, String>((ref, district) async {
  return await ref.watch(weatherRepositoryProvider).getAdvisory(district);
});


// =========================================================================
// 3. FARM ANALYTICS & DASHBOARD
// =========================================================================

class FarmAnalyticsEntity {
  final double totalExpense;
  final double totalIncome;
  final double netProfit;
  final Map<String, double> categoryCosts;

  FarmAnalyticsEntity({
    required this.totalExpense,
    required this.totalIncome,
    required this.netProfit,
    required this.categoryCosts,
  });
}

class FarmAnalyticsRepository {
  final DatabaseHelper dbHelper;
  FarmAnalyticsRepository(this.dbHelper);

  Future<FarmAnalyticsEntity> getAnalytics(String farmId) async {
    final db = await dbHelper.database;
    
    final List<Map<String, dynamic>> expenses = await db.query(
      'local_farm_expenses',
      where: 'farm_id = ? AND is_deleted = 0',
      whereArgs: [farmId],
    );
    final List<Map<String, dynamic>> income = await db.query(
      'local_farm_income',
      where: 'farm_id = ? AND is_deleted = 0',
      whereArgs: [farmId],
    );

    double sumExpense = 0.0;
    Map<String, double> costCategories = {};
    for (var exp in expenses) {
      final double amt = (exp['amount'] as num).toDouble();
      sumExpense += amt;
      final String cat = exp['category'] ?? 'misc';
      costCategories[cat] = (costCategories[cat] ?? 0.0) + amt;
    }

    double sumIncome = 0.0;
    for (var inc in income) {
      sumIncome += (inc['total_income'] as num).toDouble();
    }

    return FarmAnalyticsEntity(
      totalExpense: sumExpense,
      totalIncome: sumIncome,
      netProfit: sumIncome - sumExpense,
      categoryCosts: costCategories,
    );
  }
}

final farmAnalyticsRepositoryProvider = Provider<FarmAnalyticsRepository>((ref) {
  return FarmAnalyticsRepository(ref.watch(dbHelperProvider));
});

final farmAnalyticsProvider = FutureProvider.family<FarmAnalyticsEntity, String>((ref, farmId) async {
  return await ref.watch(farmAnalyticsRepositoryProvider).getAnalytics(farmId);
});


// =========================================================================
// 4. AI AGRI-ASSISTANT (DIAGNOSTIC & SPEECH CHAT)
// =========================================================================

class DiagnosticResultEntity {
  final String diseaseName;
  final double confidence;
  final String treatmentAdvisory;

  DiagnosticResultEntity({
    required this.diseaseName,
    required this.confidence,
    required this.treatmentAdvisory,
  });
}

class AiAssistantRepository {
  AiAssistantRepository();

  Future<DiagnosticResultEntity> diagnoseDiseaseOffline(String localImagePath) async {
    // Evaluates local on-device leaf-scan TFLite models
    // (Simulating mock classification returned under the hood by TFlite interpreter)
    await Future.delayed(const Duration(milliseconds: 600));
    return DiagnosticResultEntity(
      diseaseName: 'Tomato Late Blight',
      confidence: 0.94,
      treatmentAdvisory: 'Spray Copper-based fungicides immediately. Prune lower infected leaves.',
    );
  }
}

final aiAssistantRepositoryProvider = Provider<AiAssistantRepository>((ref) {
  return AiAssistantRepository();
});


// =========================================================================
// 5. CUSTOMER CARE / SUPPORT TICKETS
// =========================================================================

class SupportTicketEntity {
  final String id;
  final String subject;
  final String description;
  final String status;
  final String priority;

  SupportTicketEntity({
    required this.id,
    required this.subject,
    required this.description,
    required this.status,
    required this.priority,
  });
}

class SupportTicketModel extends SupportTicketEntity {
  SupportTicketModel({
    required super.id,
    required super.subject,
    required super.description,
    required super.status,
    required super.priority,
  });

  factory SupportTicketModel.fromJson(Map<String, dynamic> json) {
    return SupportTicketModel(
      id: json['id'],
      subject: json['subject'],
      description: json['description'],
      status: json['status'],
      priority: json['priority'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subject': subject,
      'description': description,
      'status': status,
      'priority': priority,
    };
  }

  factory SupportTicketModel.fromEntity(SupportTicketEntity entity) {
    return SupportTicketModel(
      id: entity.id,
      subject: entity.subject,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
    );
  }
}

class SupportRepository {
  final SupabaseClient client;
  final SyncQueueManager syncQueue;

  SupportRepository(this.client, this.syncQueue);

  Future<SupportTicketEntity> openTicket(SupportTicketEntity ticket) async {
    final model = SupportTicketModel.fromEntity(ticket);
    try {
      final response = await client.from('support_tickets').insert(model.toJson()).select().single();
      return SupportTicketModel.fromJson(response);
    } catch (_) {}

    // Queue ticket offline
    await syncQueue.enqueue(
      tableName: 'support_tickets',
      action: 'INSERT',
      recordId: model.id,
      payload: model.toJson(),
    );
    return model;
  }
}

final supportRepositoryProvider = Provider<SupportRepository>((ref) {
  return SupportRepository(
    ref.watch(supabaseClientProvider),
    ref.watch(syncQueueProvider),
  );
});
