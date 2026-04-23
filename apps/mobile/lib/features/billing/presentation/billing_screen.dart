import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/network/api_client.dart';
import '../../auth/domain/auth_state.dart';

class BillingScreen extends ConsumerStatefulWidget {
  const BillingScreen({super.key});

  @override
  ConsumerState<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends ConsumerState<BillingScreen> {
  List<dynamic> invoices = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchInvoices();
  }

  Future<void> _fetchInvoices() async {
    try {
      final dio = ref.read(dioProvider);
      final userId = ref.read(authProvider).userId;
      final response = await dio.get('/v1/billing/invoices/$userId');
      setState(() {
        invoices = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        invoices = [];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Billing')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : invoices.isEmpty
          ? const Center(child: Text("No recent invoices found."))
          : ListView.builder(
              itemCount: invoices.length,
              itemBuilder: (context, index) {
                final invoice = invoices[index];
                return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: ListTile(
                        leading: const Icon(Icons.receipt, color: Colors.green),
                        title: Text(
                          'Invoice #${invoice['id'].toString().substring(0, 8)}',
                        ),
                        subtitle: Text('Status: ${invoice['status']}'),
                        trailing: Text('\$${invoice['amount']}'),
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
