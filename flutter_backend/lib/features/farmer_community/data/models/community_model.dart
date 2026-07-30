// Folder Path: lib/features/farmer_community/data/models/
// Dart Filename: community_model.dart

import 'dart:convert';
import '../../domain/entities/community_entity.dart';

class SafeJsonParser {
  static List<String> parseStringList(dynamic input) {
    if (input == null) return [];
    if (input is List) {
      return input.map((e) => e.toString()).toList();
    }
    if (input is String) {
      try {
        final decoded = jsonDecode(input);
        if (decoded is List) {
          return decoded.map((e) => e.toString()).toList();
        }
      } catch (_) {}
    }
    return [];
  }
}

class CommunityPostModel extends CommunityPostEntity {
  CommunityPostModel({
    required super.id,
    required super.authorId,
    required super.title,
    required super.content,
    required super.tags,
    required super.category,
    required super.syncVersion,
    required super.lastModifiedAt,
    required super.isDeleted,
  });

  factory CommunityPostModel.fromJson(Map<String, dynamic> json) {
    return CommunityPostModel(
      id: json['id'],
      authorId: json['author_id'],
      title: json['title'],
      content: json['content'],
      tags: SafeJsonParser.parseStringList(json['tags']),
      category: json['category'] ?? 'general',
      syncVersion: json['sync_version'] ?? 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
      isDeleted: json['is_deleted'] == true || json['is_deleted'] == 1,
    );
  }


  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'author_id': authorId,
      'title': title,
      'content': content,
      'tags': jsonEncode(tags), // Convert string list to JSON string for SQLite/Supabase array compatibility
      'category': category,
      'sync_version': syncVersion,
      'last_modified_at': lastModifiedAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory CommunityPostModel.fromEntity(CommunityPostEntity entity) {
    return CommunityPostModel(
      id: entity.id,
      authorId: entity.authorId,
      title: entity.title,
      content: entity.content,
      tags: entity.tags,
      category: entity.category,
      syncVersion: entity.syncVersion,
      lastModifiedAt: entity.lastModifiedAt,
      isDeleted: entity.isDeleted,
    );
  }
}

class CommunityCommentModel extends CommunityCommentEntity {
  CommunityCommentModel({
    required super.id,
    required super.postId,
    required super.authorId,
    required super.content,
    required super.syncVersion,
    required super.lastModifiedAt,
    required super.isDeleted,
  });

  factory CommunityCommentModel.fromJson(Map<String, dynamic> json) {
    return CommunityCommentModel(
      id: json['id'],
      postId: json['post_id'],
      authorId: json['author_id'],
      content: json['content'],
      syncVersion: json['sync_version'] ?? 1,
      lastModifiedAt: DateTime.parse(json['last_modified_at']),
      isDeleted: json['is_deleted'] == true || json['is_deleted'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'post_id': postId,
      'author_id': authorId,
      'content': content,
      'sync_version': syncVersion,
      'last_modified_at': lastModifiedAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory CommunityCommentModel.fromEntity(CommunityCommentEntity entity) {
    return CommunityCommentModel(
      id: entity.id,
      postId: entity.postId,
      authorId: entity.authorId,
      content: entity.content,
      syncVersion: entity.syncVersion,
      lastModifiedAt: entity.lastModifiedAt,
      isDeleted: entity.isDeleted,
    );
  }
}
