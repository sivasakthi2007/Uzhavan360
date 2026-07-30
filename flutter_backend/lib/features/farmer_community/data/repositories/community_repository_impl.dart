// Folder Path: lib/features/farmer_community/data/repositories/
// Dart Filename: community_repository_impl.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/entities/community_entity.dart';
import '../models/community_model.dart';
import '../../../../core/storage/database_helper.dart';
import '../../../../core/network/sync_queue_manager.dart';

abstract class CommunityRepository {
  Future<List<CommunityPostEntity>> getPosts();
  Future<CommunityPostEntity> createPost(CommunityPostEntity post);
  Future<CommunityCommentEntity> addComment(CommunityCommentEntity comment);
}

class CommunityRepositoryImpl implements CommunityRepository {
  final DatabaseHelper dbHelper;
  final SupabaseClient supabase;
  final SyncQueueManager syncQueue;
  final bool isOnline;

  CommunityRepositoryImpl({
    required this.dbHelper,
    required this.supabase,
    required this.syncQueue,
    required this.isOnline,
  });

  @override
  Future<List<CommunityPostEntity>> getPosts() async {
    if (isOnline) {
      try {
        final response = await supabase
            .from('community_posts')
            .select()
            .eq('is_deleted', false)
            .order('created_at', ascending: false);
        final List<dynamic> data = response as List<dynamic>;
        return data.map((json) => CommunityPostModel.fromJson(json)).toList();
      } catch (_) {}
    }
    return [];
  }

  @override
  Future<CommunityPostEntity> createPost(CommunityPostEntity post) async {
    final model = CommunityPostModel.fromEntity(post);

    if (isOnline) {
      try {
        final response = await supabase
            .from('community_posts')
            .insert(model.toJson())
            .select()
            .single();
        return CommunityPostModel.fromJson(response);
      } catch (_) {}
    }

    // Queue post offline
    await syncQueue.enqueue(
      tableName: 'community_posts',
      action: 'INSERT',
      recordId: model.id,
      payload: model.toJson(),
    );
    return model;
  }

  @override
  Future<CommunityCommentEntity> addComment(CommunityCommentEntity comment) async {
    final model = CommunityCommentModel.fromEntity(comment);

    if (isOnline) {
      try {
        final response = await supabase
            .from('community_comments')
            .insert(model.toJson())
            .select()
            .single();
        return CommunityCommentModel.fromJson(response);
      } catch (_) {}
    }

    // Queue comment offline
    await syncQueue.enqueue(
      tableName: 'community_comments',
      action: 'INSERT',
      recordId: model.id,
      payload: model.toJson(),
    );
    return model;
  }
}
