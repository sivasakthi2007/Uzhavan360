// Folder Path: lib/core/error/
// Dart Filename: failures.dart

abstract class Failure {
  final String message;
  final String tamilMessage;
  
  Failure(this.message, {this.tamilMessage = 'தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'});

  @override
  String toString() => '$message ($tamilMessage)';
}

class DatabaseFailure extends Failure {
  DatabaseFailure(super.message, {super.tamilMessage = 'உள்ளூர் தரவுத்தள பிழை. சாதன நினைவகத்தை சரிபார்க்கவும்.'});
}

class ServerFailure extends Failure {
  final int? statusCode;
  ServerFailure(super.message, {this.statusCode, super.tamilMessage = 'சேவையக பிழை. மீண்டும் சிறிது நேரம் கழித்து முயற்சிக்கவும்.'});
}

class NetworkFailure extends Failure {
  NetworkFailure(super.message, {super.tamilMessage = 'இணைய இணைப்பு இல்லை. உங்களது மொபைல் டேட்டாவை சரிபார்க்கவும்.'});
}

class AuthFailure extends Failure {
  AuthFailure(super.message, {super.tamilMessage = 'அங்கீகார தோல்வி. தயவுசெய்து மீண்டும் உள்நுழையவும்.'});
}

class CacheFailure extends Failure {
  CacheFailure(super.message, {super.tamilMessage = 'தற்காலிக சேமிப்பு பிழை.'});
}

class SyncConflictFailure extends Failure {
  final Map<String, dynamic> localData;
  final Map<String, dynamic> remoteData;
  SyncConflictFailure(super.message, {
    required this.localData,
    required this.remoteData,
    super.tamilMessage = 'ஒத்திசைவு முரண்பாடு. தரவு பதிப்பு சரிபார்க்கப்படுகிறது.',
  });
}

