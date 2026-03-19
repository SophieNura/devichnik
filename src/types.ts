export type SwipeChoice = "like" | "pass";

export type AppStage =
  | "intro"
  | "browse"
  | "no-matches"
  | "finalists"
  | "winner"
  | "empty";

export type Profile = {
  id: string;
  imageUrl: string;
  name: string;
  hobbies: string[];
  occupation: string;
  style: string;
  pets: string;
  worstAct: string;
  about: string;
};

export type ProfileLoadIssue = {
  file: string;
  reason: string;
};
