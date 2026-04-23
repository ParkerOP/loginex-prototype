import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/network/api_client.dart';
import '../../auth/domain/auth_state.dart';

class MyTripsScreen extends ConsumerStatefulWidget {
  const MyTripsScreen({super.key});

  @override
  ConsumerState<MyTripsScreen> createState() => _MyTripsScreenState();
}

class _MyTripsScreenState extends ConsumerState<MyTripsScreen> {
  List<dynamic> trips = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTrips();
  }

  Future<void> _fetchTrips() async {
    try {
      final dio = ref.read(dioProvider);
      final userId = ref.read(authProvider).userId;
      final response = await dio.get('/v1/trips/driver/$userId');
      setState(() {
        trips = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        trips = [
          {
            'id': 'T1',
            'status': 'DELIVERED',
            'createdAt': '2023-10-27T10:00:00Z',
          },
        ];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Trips')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : trips.isEmpty
          ? const Center(child: Text("No trips found."))
          : ListView.builder(
              itemCount: trips.length,
              itemBuilder: (context, index) {
                final trip = trips[index];
                return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: ListTile(
                        leading: const Icon(
                          Icons.local_shipping,
                          color: Colors.blue,
                        ),
                        title: Text(
                          'Trip #${trip['id'].toString().substring(0, 8)}',
                        ),
                        subtitle: Text('Status: ${trip['status']}'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      ),
                    )
                    .animate()
                    .fadeIn(delay: Duration(milliseconds: 100 * index))
                    .slideY();
              },
            ),
    );
  }
}
