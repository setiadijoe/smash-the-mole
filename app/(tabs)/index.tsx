import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GRID_SIZE = 3;
const TOTAL_HOLES = GRID_SIZE * GRID_SIZE;
const HOLE_IDS = Array.from({ length: TOTAL_HOLES }, (_, i) => i);

export default function App() {
  const [score, setScore] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<"mole" | "mouse" | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [readyModalVisible, setReadyModalVisible] = useState(true);

  const [scaleAnim] = useState(new Animated.Value(0)); // Mole pop-up
  const [hitScale] = useState(new Animated.Value(1));   // Hit animation

  // Initialize audio players
  const moleHitPlayer = useAudioPlayer(require("../../assets/sounds/hit.mp3"));
  const mouseSlapPlayer = useAudioPlayer(require("../../assets/sounds/slap.mp3"));

  // Play a sound
  const playSound = (player: ReturnType<typeof useAudioPlayer>) => {
    player.seekTo(0); // Reset to start
    player.play();
  };

  // Randomly pick mole or mouse
  useEffect(() => {
    if (timeLeft === 0) return;

    const intervalTime = timeLeft <= 10 ? 500 : 1000;

    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * TOTAL_HOLES);
      const type = Math.random() > 0.3 ? "mole" : "mouse";
      setActiveIndex(index);
      setActiveType(type);

      if (type === "mole") {
        scaleAnim.setValue(0);
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [timeLeft, scaleAnim]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) {
      if (!readyModalVisible) setModalVisible(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, readyModalVisible]);

  // Handle hit
  const handleHit = (index: number) => {
    if (index !== activeIndex) return;

    Animated.sequence([
      Animated.timing(hitScale, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(hitScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (activeType === "mole") {
      setScore((prev) => prev + 1);
      playSound(moleHitPlayer);
    } else if (activeType === "mouse") {
      setScore((prev) => prev - 1);
      playSound(mouseSlapPlayer);
    }

    setActiveIndex(null);
    setActiveType(null);
  };

  // Rows for grid
  const getRows = () => {
    const rows: number[][] = [];
    for (let i = 0; i < TOTAL_HOLES; i += GRID_SIZE) {
      rows.push(HOLE_IDS.slice(i, i + GRID_SIZE));
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {/* Score Counter */}
      <View style={styles.counterBox}>
        <Text style={styles.counterText}>Score: {score}</Text>
        <Text style={styles.counterText}>⏱ {timeLeft}s</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {getRows().map((row) => (
          <View key={`row-${row[0]}`} style={styles.row}>
            {row.map((id) => (
              <TouchableOpacity
                key={id}
                style={styles.hole}
                onPress={() => handleHit(id)}
                activeOpacity={0.8}
              >
                {id === activeIndex && activeType === "mole" && (
                  <Animated.Image
                    source={require("../../assets/images/mole.png")}
                    style={[styles.image, { transform: [{ scale: scaleAnim }] }]}
                  />
                )}
                {id === activeIndex && activeType === "mouse" && (
                  <Animated.Image
                    source={require("../../assets/images/mouse.png")}
                    style={[styles.image, { transform: [{ scale: hitScale }] }]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Pre-Game Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={readyModalVisible}
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontWeight: "bold", textAlign: "center" }]}>
              Are you ready to smash some moles? 🐹
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => {
                setReadyModalVisible(false);
                setTimeLeft(30);
              }}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* End-Game Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {score > 0 && (
              <Text style={[styles.modalTitle, { fontWeight: "bold", textAlign: "center" }]}>
                🎉 Awesome! You smashed {score} {score === 1 ? "mole" : "moles"}!
              </Text>
            )}
            {score === 0 && (
              <Text style={[styles.modalTitle, { textAlign: "center" }]}>
                🤔 Hmm… You didn’t smash any moles. Try again?
              </Text>
            )}
            {score < 0 && (
              <Text style={[styles.modalTitle, { fontWeight: "bold", textAlign: "center" }]}>
                😱 Whoa! You hit the wrong targets! Focus on the moles!
              </Text>
            )}
            <Pressable
              style={styles.button}
              onPress={() => {
                setScore(0);
                setTimeLeft(30);
                setModalVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },

  counterBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 250,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "black",
    borderRadius: 10,
  },
  counterText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  grid: {
    width: 300,
    height: 300,
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  hole: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    backgroundColor: "#444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
