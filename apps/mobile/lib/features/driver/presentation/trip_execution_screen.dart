import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class TripExecutionScreen extends StatefulWidget {
  final Map<String, dynamic> load;

  const TripExecutionScreen({super.key, required this.load});

  @override
  State<TripExecutionScreen> createState() => _TripExecutionScreenState();
}

class _TripExecutionScreenState extends State<TripExecutionScreen> {
  int _currentStep = 0;
  bool _isPODSubmitted = false;

  void _advanceStep() {
    if (_currentStep < 3) {
      setState(() => _currentStep++);
    }
  }

  void _submitPOD() async {
    // Simulate POD upload
    setState(() => _isPODSubmitted = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      Navigator.of(context).pop(); // Return to dashboard
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Active Trip'),
        backgroundColor: Colors.transparent,
      ),
      body: _isPODSubmitted ? _buildSuccessState() : _buildActiveTrip(),
    );
  }

  Widget _buildSuccessState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.green.withOpacity(0.2),
            ),
            child: const Icon(Icons.check_circle, color: Colors.green, size: 80),
          ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
          const SizedBox(height: 24),
          Text(
            'Delivery Complete!',
            style: Theme.of(context).textTheme.displayMedium,
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),
          const SizedBox(height: 12),
          Text(
            'Earnings added to your wallet',
            style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 16),
          ).animate().fadeIn(delay: 400.ms),
        ],
      ),
    );
  }

  Widget _buildActiveTrip() {
    return Column(
      children: [
        // Map placeholder
        Expanded(
          flex: 2,
          child: Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 64, color: Colors.white.withOpacity(0.2)),
                  const SizedBox(height: 16),
                  Text('Live Map View', style: TextStyle(color: Colors.white.withOpacity(0.5))),
                ],
              ),
            ),
          ).animate().fadeIn().scale(begin: const Offset(0.95, 0.95)),
        ),

        // Status Stepper
        Expanded(
          flex: 3,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 20,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Trip to ${widget.load['destination']}',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 32),

                // Custom Stepper
                _buildStep(0, 'En Route to Pickup', isActive: _currentStep >= 0, isDone: _currentStep > 0),
                _buildStep(1, 'Arrived at Pickup', isActive: _currentStep >= 1, isDone: _currentStep > 1),
                _buildStep(2, 'In Transit', isActive: _currentStep >= 2, isDone: _currentStep > 2),
                _buildStep(3, 'Arrived at Drop-off', isActive: _currentStep >= 3, isDone: false, isLast: true),

                const Spacer(),

                if (_currentStep < 3)
                  ElevatedButton(
                    onPressed: _advanceStep,
                    child: const Text('Update Status'),
                  ).animate().fadeIn()
                else
                  ElevatedButton(
                    onPressed: _submitPOD,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                    ),
                    child: const Text('Capture POD & Complete'),
                  ).animate().scale(curve: Curves.elasticOut),
              ],
            ),
          ).animate().slideY(begin: 0.2, curve: Curves.easeOutQuad),
        ),
      ],
    );
  }

  Widget _buildStep(int index, String title, {required bool isActive, required bool isDone, bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDone
                  ? Colors.green
                  : isActive ? Theme.of(context).colorScheme.primary : Colors.white.withOpacity(0.1),
                border: Border.all(
                  color: isActive ? Colors.transparent : Colors.white.withOpacity(0.3),
                ),
              ),
              child: isDone ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 30,
                color: isDone ? Colors.green : Colors.white.withOpacity(0.1),
              ),
          ],
        ),
        const SizedBox(width: 16),
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            color: isActive ? Colors.white : Colors.white.withOpacity(0.5),
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    ).animate(target: isActive ? 1 : 0).fade(end: 1);
  }
}
