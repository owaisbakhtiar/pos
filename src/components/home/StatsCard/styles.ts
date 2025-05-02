import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  statsCard: {
    width: "48%",
    height: 110,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTextContainer: {
    justifyContent: "center",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  statsTitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
