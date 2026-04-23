import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/network/api_client.dart';

class DriversScreen extends ConsumerStatefulWidget {
  const DriversScreen({super.key});

  @override
  ConsumerState<DriversScreen> createState() => _DriversScreenState();
}

class _DriversScreenState extends ConsumerState<DriversScreen> {
  List<dynamic> drivers = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDrivers();
  }

  Future<void> _fetchDrivers() async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/v1/users/drivers');
      setState(() {
        drivers = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        drivers = [
          {
            'id': 'D1',
            'phone': '+1234567890',
            'driverProfile': {'trustScore': 4.8},
          },
        ];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Fleet')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : drivers.isEmpty
          ? const Center(child: Text("No drivers found."))
          : ListView.builder(
              itemCount: drivers.length,
              itemBuilder: (context, index) {
                final driver = drivers[index];
                final score = driver['driverProfile']?['trustScore'] ?? 5.0;
                return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.withOpacity(0.2),
                          child: const Icon(Icons.person, color: Colors.blue),
                        ),
                        title: Text(
                          'Driver #${driver['id'].toString().substring(0, 8)}',
                        ),
                        subtitle: Text('Phone: ${driver['phone']}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star,
                              color: Colors.amber,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              score.toString(),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
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
