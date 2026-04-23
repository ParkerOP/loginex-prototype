import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/network/api_client.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  Map<String, dynamic>? profileData;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/v1/users/profile');
      setState(() {
        profileData = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        profileData = {
          'name': 'John Doe (Fallback)',
          'email': 'john@example.com',
          'role': 'DRIVER',
        };
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Account Details',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ).animate().fadeIn().slideX(),
                  const SizedBox(height: 20),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ID: ${profileData?['id'] ?? 'Unknown'}'),
                          const SizedBox(height: 8),
                          Text('Phone: ${profileData?['phone'] ?? 'Unknown'}'),
                          const SizedBox(height: 8),
                          Text('Role: ${profileData?['role'] ?? 'Unknown'}'),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 200.ms).slideY(),
                ],
              ),
            ),
    );
  }
}
