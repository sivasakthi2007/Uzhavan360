class VillageModel {
  final String id;
  final String name;
  final String district;
  final double? latitude;
  final double? longitude;

  VillageModel({
    required this.id,
    required this.name,
    required this.district,
    this.latitude,
    this.longitude,
  });

  factory VillageModel.fromJson(Map<String, dynamic> json) {
    return VillageModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      district: json['district'] ?? '',
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'district': district,
    'latitude': latitude,
    'longitude': longitude,
  };
}

class ProfileModel {
  final String id;
  final String name;
  final String phone;
  final String? villageId;
  final String? villageName;
  final String role; // 'demand', 'provider', 'admin'
  final String preferredLanguage;
  final String? photoUrl;

  ProfileModel({
    required this.id,
    required this.name,
    required this.phone,
    this.villageId,
    this.villageName,
    required this.role,
    this.preferredLanguage = 'ta',
    this.photoUrl,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      villageId: json['village_id']?.toString(),
      villageName: json['village_name'],
      role: json['role'] ?? 'demand',
      preferredLanguage: json['preferred_language'] ?? 'ta',
      photoUrl: json['photo_url'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'village_id': villageId,
    'village_name': villageName,
    'role': role,
    'preferred_language': preferredLanguage,
    'photo_url': photoUrl,
  };
}

class ServiceProviderModel {
  final String id;
  final String profileId;
  final String providerType; // 'maistry', 'technician'
  final String title;
  final int experienceYears;
  final double serviceRadiusKm;
  final String? baseRate;
  final bool isPhoneVerified;
  final int squadSize;
  final String availabilityStatus; // 'available_today', 'available_date', 'booked'
  final String? availableDate;
  final String? villageName;
  final String? phone;
  final int vouchesCount;
  final List<String> skills;

  ServiceProviderModel({
    required this.id,
    required this.profileId,
    required this.providerType,
    required this.title,
    this.experienceYears = 0,
    this.serviceRadiusKm = 10.0,
    this.baseRate,
    this.isPhoneVerified = true,
    this.squadSize = 1,
    this.availabilityStatus = 'available_today',
    this.availableDate,
    this.villageName,
    this.phone,
    this.vouchesCount = 0,
    this.skills = const [],
  });

  factory ServiceProviderModel.fromJson(Map<String, dynamic> json) {
    return ServiceProviderModel(
      id: json['id']?.toString() ?? '',
      profileId: json['profile_id']?.toString() ?? '',
      providerType: json['provider_type'] ?? 'technician',
      title: json['title'] ?? '',
      experienceYears: json['experience_years'] ?? 0,
      serviceRadiusKm: json['service_radius_km'] != null 
          ? (json['service_radius_km'] as num).toDouble() 
          : 10.0,
      baseRate: json['base_rate'],
      isPhoneVerified: json['is_phone_verified'] ?? true,
      squadSize: json['squad_size'] ?? 1,
      availabilityStatus: json['availability_status'] ?? 'available_today',
      availableDate: json['available_date'],
      villageName: json['village_name'],
      phone: json['phone'],
      vouchesCount: json['vouches_count'] ?? 0,
      skills: json['skills'] != null ? List<String>.from(json['skills']) : [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'profile_id': profileId,
    'provider_type': providerType,
    'title': title,
    'experience_years': experienceYears,
    'service_radius_km': serviceRadiusKm,
    'base_rate': baseRate,
    'is_phone_verified': isPhoneVerified,
    'squad_size': squadSize,
    'availability_status': availabilityStatus,
    'available_date': availableDate,
    'village_name': villageName,
    'phone': phone,
    'vouches_count': vouchesCount,
    'skills': skills,
  };
}

class ServiceRequestModel {
  final String id;
  final String requesterId;
  final String requestType; // 'labour_squad', 'technician'
  final String skillName;
  final int requiredWorkers;
  final String requiredDate;
  final String requiredTime;
  final String? villageName;
  final String? duration;
  final String? budgetOffered;
  final String? problemDetails;
  final String urgency; // 'normal', 'urgent'
  final String status; // 'broadcasting', 'connected', 'completed', 'cancelled'
  final String createdAt;

  ServiceRequestModel({
    required this.id,
    required this.requesterId,
    required this.requestType,
    required this.skillName,
    this.requiredWorkers = 1,
    required this.requiredDate,
    required this.requiredTime,
    this.villageName,
    this.duration,
    this.budgetOffered,
    this.problemDetails,
    this.urgency = 'normal',
    this.status = 'broadcasting',
    required this.createdAt,
  });

  factory ServiceRequestModel.fromJson(Map<String, dynamic> json) {
    return ServiceRequestModel(
      id: json['id']?.toString() ?? '',
      requesterId: json['requester_id']?.toString() ?? '',
      requestType: json['request_type'] ?? 'labour_squad',
      skillName: json['skill_name'] ?? '',
      requiredWorkers: json['required_workers'] ?? 1,
      requiredDate: json['required_date'] ?? '',
      requiredTime: json['required_time'] ?? '',
      villageName: json['village_name'],
      duration: json['duration'],
      budgetOffered: json['budget_offered'],
      problemDetails: json['problem_details'],
      urgency: json['urgency'] ?? 'normal',
      status: json['status'] ?? 'broadcasting',
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'requester_id': requesterId,
    'request_type': requestType,
    'skill_name': skillName,
    'required_workers': requiredWorkers,
    'required_date': requiredDate,
    'required_time': requiredTime,
    'village_name': villageName,
    'duration': duration,
    'budget_offered': budgetOffered,
    'problem_details': problemDetails,
    'urgency': urgency,
    'status': status,
    'created_at': createdAt,
  };
}

class VouchModel {
  final String id;
  final String voucherProfileId;
  final String targetProviderId;
  final String? voucherVillageName;
  final String? comment;
  final String createdAt;

  VouchModel({
    required this.id,
    required this.voucherProfileId,
    required this.targetProviderId,
    this.voucherVillageName,
    this.comment,
    required this.createdAt,
  });

  factory VouchModel.fromJson(Map<String, dynamic> json) {
    return VouchModel(
      id: json['id']?.toString() ?? '',
      voucherProfileId: json['voucher_profile_id']?.toString() ?? '',
      targetProviderId: json['target_provider_id']?.toString() ?? '',
      voucherVillageName: json['voucher_village_name'],
      comment: json['comment'],
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'voucher_profile_id': voucherProfileId,
    'target_provider_id': targetProviderId,
    'voucher_village_name': voucherVillageName,
    'comment': comment,
    'created_at': createdAt,
  };
}

class OutboxItemModel {
  final int? localId;
  final String operation; // 'CREATE_REQUEST', 'UPDATE_AVAILABILITY', 'CREATE_VOUCH'
  final String payloadJson;
  final String createdAt;
  final int retryCount;
  final String syncState; // 'PENDING', 'SYNCING', 'SYNCED', 'FAILED'

  OutboxItemModel({
    this.localId,
    required this.operation,
    required this.payloadJson,
    required this.createdAt,
    this.retryCount = 0,
    this.syncState = 'PENDING',
  });

  factory OutboxItemModel.fromMap(Map<String, dynamic> map) {
    return OutboxItemModel(
      localId: map['local_id'] as int?,
      operation: map['operation'] as String,
      payloadJson: map['payload_json'] as String,
      createdAt: map['created_at'] as String,
      retryCount: map['retry_count'] as int? ?? 0,
      syncState: map['sync_state'] as String? ?? 'PENDING',
    );
  }

  Map<String, dynamic> toMap() => {
    if (localId != null) 'local_id': localId,
    'operation': operation,
    'payload_json': payloadJson,
    'created_at': createdAt,
    'retry_count': retryCount,
    'sync_state': syncState,
  };
}
