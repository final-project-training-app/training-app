export const DEFAULT_TRAINER_ID = 1;

const TRAINER_PREFERENCE_STORAGE_KEY = "home-trainer-id";

export function getStoredTrainerId() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(TRAINER_PREFERENCE_STORAGE_KEY);
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue < DEFAULT_TRAINER_ID) {
    return null;
  }

  return parsedValue;
}

export function setStoredTrainerId(trainerId: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TRAINER_PREFERENCE_STORAGE_KEY, String(trainerId));
}