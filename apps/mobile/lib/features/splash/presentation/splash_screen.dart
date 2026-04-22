import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../../core/performance/performance_config.dart';

class SplashScreen extends ConsumerStatefulWidget {
  final VoidCallback onComplete;

  const SplashScreen({super.key, required this.onComplete});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isReducedMotion = false;

  @override
  void initState() {
    super.initState();
    _playAudio();

    // We wait 4 seconds (duration of the animation) then finish
    Future.delayed(const Duration(milliseconds: 4000), () {
      if (mounted) {
        widget.onComplete();
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // In a real app we might also check MediaQuery.of(context).disableAnimations
    _isReducedMotion = ref.read(performanceConfigProvider);
  }

  Future<void> _playAudio() async {
    try {
      await _audioPlayer.play(AssetSource('audio/brand.wav'));
    } catch (e) {
      debugPrint("Audio playback error: $e");
    }
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isReducedMotion) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: Center(
          child: Image.asset('assets/images/logo.ico', width: 80, height: 80)
              .animate(onPlay: (controller) => controller.repeat())
              .shimmer(duration: 1200.ms, color: Colors.white24),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Animated Background glow
          Positioned.fill(
            child: Center(
              child:
                  Container(
                        width: 300,
                        height: 300,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Theme.of(
                            context,
                          ).primaryColor.withOpacity(0.2),
                        ),
                      )
                      .animate(
                        onPlay: (controller) =>
                            controller.repeat(reverse: true),
                      )
                      .blur(duration: 2.seconds)
                      .scale(
                        begin: const Offset(0.8, 0.8),
                        end: const Offset(1.2, 1.2),
                        duration: 2.seconds,
                      ),
            ),
          ),

          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  height: 120,
                  width: 300,
                  child: Stack(
                    alignment: Alignment.center,
                    clipBehavior: Clip.none,
                    children: [
                      // Base text row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                                "Log",
                                style: TextStyle(
                                  fontSize: 48,
                                  fontWeight: FontWeight.w900,
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 500.ms)
                              .slideX(begin: -0.5, end: 0, duration: 500.ms),

                          // The squishable 'i'
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            height: 48,
                            width: 12,
                            child: Stack(
                              alignment: Alignment.bottomCenter,
                              children: [
                                // Dot of 'i'
                                Positioned(
                                  top: 0,
                                  child:
                                      Container(
                                            width: 12,
                                            height: 12,
                                            decoration: const BoxDecoration(
                                              color: Colors.white,
                                              shape: BoxShape.circle,
                                            ),
                                          )
                                          .animate()
                                          .fadeIn(duration: 500.ms)
                                          // At ~1500ms, X lands and dot vanishes/squishes
                                          .scale(
                                            begin: const Offset(1, 1),
                                            end: const Offset(0, 0),
                                            delay: 1500.ms,
                                            duration: 200.ms,
                                          )
                                          // At ~3000ms, X leaves and dot returns
                                          .scale(
                                            begin: const Offset(0, 0),
                                            end: const Offset(1, 1),
                                            delay: 1300
                                                .ms, // relative delay since previous scale 1500+200+1300 = 3000
                                            duration: 200.ms,
                                          ),
                                ),
                                // Stem of 'i'
                                Container(
                                      width: 12,
                                      height: 32,
                                      color: Colors.white,
                                    )
                                    .animate()
                                    .fadeIn(duration: 500.ms)
                                    .scaleY(
                                      begin: 1.0,
                                      end: 0.1,
                                      alignment: Alignment.bottomCenter,
                                      delay: 1500.ms,
                                      duration: 200.ms,
                                    )
                                    .scaleY(
                                      begin: 0.1,
                                      end: 1.0,
                                      alignment: Alignment.bottomCenter,
                                      delay: 1300
                                          .ms, // relative delay 3000ms total
                                      duration: 200.ms,
                                    ),
                              ],
                            ),
                          ),

                          const Text(
                                "ne",
                                style: TextStyle(
                                  fontSize: 48,
                                  fontWeight: FontWeight.w900,
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 500.ms)
                              .slideX(begin: 0.5, end: 0, duration: 500.ms),

                          const SizedBox(width: 40), // Space for X
                        ],
                      ),

                      // The final 'X' that appears after animation
                      Positioned(
                        right: 20,
                        bottom: 0,
                        child: Text(
                          "X",
                          style: TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.w900,
                            color: Theme.of(context).primaryColor,
                          ),
                        ).animate().fadeIn(delay: 3200.ms, duration: 300.ms),
                      ),

                      // The hopping 'X' logo
                      Positioned(
                        bottom: 0,
                        right: 20,
                        child:
                            Image.asset(
                                  'assets/images/logo.ico',
                                  width: 40,
                                  height: 40,
                                )
                                .animate()
                                // Start completely hidden and rotated
                                .fadeIn(delay: 500.ms, duration: 300.ms)
                                .slide(
                                  begin: const Offset(3.0, -5.0),
                                  end: const Offset(-2.0, 0), // Land on 'i'
                                  delay: 500.ms,
                                  duration: 1000.ms,
                                  curve: Curves.easeInQuad,
                                )
                                .rotate(
                                  begin: 2.0,
                                  end: 0,
                                  delay: 500.ms,
                                  duration: 1000.ms,
                                )
                                // Stay on 'i' squishing it
                                .moveY(
                                  begin: 0,
                                  end: 10,
                                  delay: 1500.ms,
                                  duration: 200.ms,
                                )
                                .scale(
                                  begin: const Offset(1, 1),
                                  end: const Offset(1.2, 0.8),
                                  delay: 1500.ms,
                                  duration: 200.ms,
                                )
                                // Hop to end position
                                .slide(
                                  begin: const Offset(0, 0), // From current pos
                                  end: const Offset(2.0, -10.0), // Relative hop
                                  delay: 1300.ms, // Starts at 3000ms
                                  duration: 300.ms,
                                  curve: Curves.easeOutQuad,
                                )
                                // Hide the hopping logo as the real text 'X' fades in
                                .fadeOut(delay: 3000.ms, duration: 200.ms),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                Container(
                  height: 4,
                  width: 120,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(2),
                    gradient: LinearGradient(
                      colors: [
                        Colors.transparent,
                        Theme.of(context).primaryColor,
                        Colors.transparent,
                      ],
                    ),
                  ),
                ).animate().scaleX(
                  begin: 0.0,
                  end: 1.0,
                  delay: 3000.ms,
                  duration: 800.ms,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
