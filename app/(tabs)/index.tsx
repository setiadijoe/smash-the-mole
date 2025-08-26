import React, { useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GRID_SIZE = 3; // 3x3 grid
const TOTAL_HOLES = GRID_SIZE * GRID_SIZE;
const HOLE_IDS = Array.from({ length: TOTAL_HOLES }, (_, i) => i);

export default function App() {
  const [score, setScore] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<"mole" | "mouse" | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [modalVisible, setModalVisible] = useState(false);

  // randomly pick mole or mouse every second
  useEffect(() => {
    if (timeLeft === 0) return;
    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * TOTAL_HOLES);
      const type = Math.random() > 0.3 ? "mole" : "mouse"; // 70% mole, 30% mouse
      setActiveIndex(index);
      setActiveType(type);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // countdown timer
  useEffect(() => {
    if (timeLeft === 0) {
      setModalVisible(true); // show modal when time is up
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleHit = (index: number) => {
    if (index === activeIndex && activeType === "mole") {
      setScore((prev) => prev + 1);
    }
    if (index === activeIndex && activeType === "mouse") {
      setScore((prev) => (prev > 0 ? prev - 1 : 0)); // penalty if you hit mouse
    }
    setActiveIndex(null);
    setActiveType(null);
  };

  // Create rows for 3x3 grid
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

      {/* Game Over Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over!</Text>
            <Text style={styles.modalScore}>Final Score: {score}</Text>
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
                  <Image
                    source={require("../../assets/images/mole.png")}
                    style={styles.image}
                  />
                )}
                {id === activeIndex && activeType === "mouse" && (
                  <Image
                    source={require("../../assets/images/mouse.png")}
                    style={styles.image}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {timeLeft === 0 && (
        <Text style={styles.over}>Game Over! Final Score: {score}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },

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
    // width adjusts automatically
  },
  row: {
    flexDirection: "row",
  },
  hole: {
    flexBasis: `${100 / GRID_SIZE}%`, // each hole is 1/3 of the row
    aspectRatio: 1, // makes it square
    margin: 1,
    backgroundColor: "#444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  over: { fontSize: 24, fontWeight: "bold", marginTop: 20 },
    // Modal Styles
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
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
    },
    modalScore: {
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
