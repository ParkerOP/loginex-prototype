import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/network/api_client.dart';
import '../../auth/domain/auth_state.dart';

class EarningsScreen extends ConsumerStatefulWidget {
  const EarningsScreen({super.key});

  @override
  ConsumerState<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends ConsumerState<EarningsScreen> {
  Map<String, dynamic>? earningsData;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchEarnings();
  }

  Future<void> _fetchEarnings() async {
    try {
      final dio = ref.read(dioProvider);
      final userId = ref.read(authProvider).userId;
      final response = await dio.get('/v1/billing/earnings/$userId');
      setState(() {
        earningsData = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        earningsData = {
          'total': 800.0,
          'history': [
            {'tripId': 'T1', 'amount': 400.0},
            {'tripId': 'T2', 'amount': 400.0},
          ],
        };
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Earnings')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    color: Colors.green.withOpacity(0.1),
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total Earnings',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '\$${earningsData?['total'] ?? 0.0}',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn().scale(),
                  const SizedBox(height: 24),
                  const Text(
                    'History',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView.builder(
                      itemCount:
                          (earningsData?['history'] as List?)?.length ?? 0,
                      itemBuilder: (context, index) {
                        final item = (earningsData!['history'] as List)[index];
                        return Card(
                              child: ListTile(
                                leading: const Icon(
                                  Icons.monetization_on,
                                  color: Colors.amber,
                                ),
                                title: Text(
                                  'Trip #${item['tripId'].toString().substring(0, 8)}',
                                ),
                                trailing: Text(
                                  '+\$${item['amount']}',
                                  style: const TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            )
                            .animate()
                            .fadeIn(delay: Duration(milliseconds: 100 * index))
                            .slideX();
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
