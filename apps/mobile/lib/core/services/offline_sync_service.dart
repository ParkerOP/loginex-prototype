import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class OfflineSyncService {
  final SharedPreferences _prefs;
  final Dio _dio;

  static const String _offlineQueueKey = 'offline_request_queue';

  OfflineSyncService(this._prefs, this._dio);

  Future<void> queueRequest(String method, String path, dynamic data) async {
    final queue = _prefs.getStringList(_offlineQueueKey) ?? [];
    queue.add(
      jsonEncode({
        'method': method,
        'path': path,
        'data': data,
        'timestamp': DateTime.now().toIso8601String(),
      }),
    );
    await _prefs.setStringList(_offlineQueueKey, queue);
  }

  Future<void> syncOfflineData() async {
    final queue = _prefs.getStringList(_offlineQueueKey) ?? [];
    if (queue.isEmpty) return;

    final updatedQueue = <String>[];

    for (final requestStr in queue) {
      try {
        final request = jsonDecode(requestStr);
        final method = request['method'];
        final path = request['path'];
        final data = request['data'];

        if (method == 'POST') {
          await _dio.post(path, data: data);
        } else if (method == 'PUT') {
          await _dio.put(path, data: data);
        }
      } catch (e) {
        updatedQueue.add(requestStr);
      }
    }

    await _prefs.setStringList(_offlineQueueKey, updatedQueue);
  }
}

final offlineSyncProvider = Provider<OfflineSyncService>((ref) {
  throw UnimplementedError();
});
