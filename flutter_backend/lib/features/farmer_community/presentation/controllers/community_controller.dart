// Folder Path: lib/features/farmer_community/presentation/controllers/
// Dart Filename: community_controller.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/community_entity.dart';
import '../repositories/community_repository_impl.dart';
import '../../../../core/di/providers.dart';

final communityRepositoryProvider = Provider<CommunityRepository>((ref) {
  return CommunityRepositoryImpl(
    dbHelper: ref.watch(dbHelperProvider),
    supabase: ref.watch(supabaseClientProvider),
    syncQueue: ref.watch(syncQueueProvider),
    isOnline: true,
  );
});

class CommunityPostNotifier extends AsyncNotifier<List<CommunityPostEntity>> {
  late final CommunityRepository _repository;

  @override
  Future<List<CommunityPostEntity>> build() async {
    _repository = ref.watch(communityRepositoryProvider);
    return await _repository.getPosts();
  }

  Future<void> submitPost(CommunityPostEntity post) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repository.createPost(post);
      return await _repository.getPosts();
    });
  }
}

final communityPostNotifierProvider = AsyncNotifierProvider<CommunityPostNotifier, List<CommunityPostEntity>>(() {
  return CommunityPostNotifier();
});
