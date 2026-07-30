// Folder Path: lib/features/farmer_community/domain/entities/
// Dart Filename: community_entity.dart

class CommunityPostEntity {
  final String id;
  final String authorId;
  final String title;
  final String content;
  final List<String> tags;
  final String category;
  final int syncVersion;
  final DateTime lastModifiedAt;
  final bool isDeleted;

  CommunityPostEntity({
    required this.id,
    required this.authorId,
    required this.title,
    required this.content,
    required this.tags,
    required this.category,
    required this.syncVersion,
    required this.lastModifiedAt,
    required this.isDeleted,
  });
}

class CommunityCommentEntity {
  final String id;
  final String postId;
  final String authorId;
  final String content;
  final int syncVersion;
  final DateTime lastModifiedAt;
  final bool isDeleted;

  CommunityCommentEntity({
    required this.id,
    required this.postId,
    required this.authorId,
    required this.content,
    required this.syncVersion,
    required this.lastModifiedAt,
    required this.isDeleted,
  });
}
