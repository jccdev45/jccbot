import type { PointsSystem } from "@/types.js";

const userPoints: PointsSystem = {};

export function initializeUserPoints(username: string): void {
  if (!userPoints[username]) {
    userPoints[username] = {
      points: 0,
      hasClaimedInitialPoints: false,
    };
  }
}

export function getUserPoints(username: string): number {
  return userPoints[username]?.points || 0;
}

export function setUserPoints(username: string, amount: number): void {
  if (!userPoints[username]) {
    initializeUserPoints(username);
  }
  if (!userPoints[username]) {
    initializeUserPoints(username);
  }
  userPoints[username]!.points = amount;
}

export function addUserPoints(username: string, amount: number): void {
  if (!userPoints[username]) {
    initializeUserPoints(username);
  }
  if (userPoints[username]) {
    userPoints[username].points += amount;
  }
}

export function subtractUserPoints(username: string, amount: number): void {
  if (!userPoints[username]) {
    initializeUserPoints(username);
  }
  if (userPoints[username]) {
    userPoints[username].points = Math.max(
      0,
      userPoints[username].points - amount
    );
  }
}

export function hasClaimedInitialPoints(username: string): boolean {
  return userPoints[username]?.hasClaimedInitialPoints || false;
}

export function canClaimInitialPoints(username: string): boolean {
  return (
    !userPoints[username] ||
    (!userPoints[username].hasClaimedInitialPoints &&
      userPoints[username].points === 0)
  );
}

export function setClaimedInitialPoints(username: string): void {
  if (!userPoints[username]) {
    initializeUserPoints(username);
  }
  if (userPoints[username]) {
    userPoints[username].hasClaimedInitialPoints = true;
  }
}

export function calculateGambleAmount(
  input: string,
  currentPoints: number
): number {
  if (input.toLowerCase() === "all") {
    return currentPoints;
  } else if (input.endsWith("%")) {
    const percentage = parseFloat(input);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      return -1;
    }
    return Math.round((percentage / 100) * currentPoints);
  } else {
    return parseInt(input, 10);
  }
}
