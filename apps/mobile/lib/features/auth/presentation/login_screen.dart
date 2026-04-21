import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../domain/auth_state.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _isDriver = true;
  bool _isLoading = false;

  void _handleLogin() async {
    if (_phoneController.text.isEmpty) return;

    setState(() => _isLoading = true);

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    ref.read(authProvider.notifier).login(
      _phoneController.text,
      _isDriver ? 'DRIVER' : 'SHIPPER'
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Theme.of(context).colorScheme.surface,
              Theme.of(context).colorScheme.background,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Logo placeholder with animation
                Hero(
                  tag: 'app_logo',
                  child: Container(
                    height: 120,
                    width: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [
                          Theme.of(context).colorScheme.primary,
                          Theme.of(context).colorScheme.secondary,
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'X',
                        style: TextStyle(
                          fontSize: 64,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ).animate(onPlay: (controller) => controller.repeat(reverse: true))
                   .scaleXY(end: 1.05, duration: 2.seconds)
                   .shimmer(duration: 3.seconds, color: Colors.white24),
                ),
                const SizedBox(height: 48),

                Text(
                  'Welcome to LogineX',
                  style: Theme.of(context).textTheme.displayMedium,
                  textAlign: TextAlign.center,
                ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2, end: 0),

                const SizedBox(height: 16),
                Text(
                  'Enter your phone number to continue',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ).animate().fadeIn(delay: 200.ms, duration: 600.ms),

                const SizedBox(height: 48),

                // Role Switcher
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isDriver = true),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: _isDriver
                                ? Theme.of(context).colorScheme.primary
                                : Colors.transparent,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Center(
                              child: Text('Driver', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isDriver = false),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: !_isDriver
                                ? Theme.of(context).colorScheme.secondary
                                : Colors.transparent,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Center(
                              child: Text('Shipper', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 400.ms).slideX(begin: -0.2),

                const SizedBox(height: 24),

                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Phone Number',
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    prefixIcon: const Icon(Icons.phone, color: Colors.white70),
                  ),
                ).animate().fadeIn(delay: 600.ms).slideX(begin: 0.2),

                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('Continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ).animate().fadeIn(delay: 800.ms).scaleXY(begin: 0.8),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
