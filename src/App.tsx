import { useMemo, useState } from "react";
import { ProfileCard } from "./components/ProfileCard";
import { SwipeDeck } from "./components/SwipeDeck";
import { copy } from "./config/copy";
import { loadProfiles } from "./data/profiles";
import { themeStyleVars } from "./theme/theme";
import type { AppStage, Profile, SwipeChoice } from "./types";

function getNextStage(likedCount: number): AppStage {
  return likedCount > 0 ? "finalists" : "no-matches";
}

export default function App() {
  const { profiles, issues } = useMemo(() => loadProfiles(), []);
  const [stage, setStage] = useState<AppStage>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([]);
  const [winner, setWinner] = useState<Profile | null>(null);

  const hasProfiles = profiles.length > 0;
  const currentProfile = profiles[currentIndex];

  const restartFlow = () => {
    setCurrentIndex(0);
    setLikedProfiles([]);
    setWinner(null);
    setStage(hasProfiles ? "intro" : "empty");
  };

  const startFlow = () => {
    if (!hasProfiles) {
      setStage("empty");
      return;
    }

    setCurrentIndex(0);
    setLikedProfiles([]);
    setWinner(null);
    setStage("browse");
  };

  const handleChoice = (choice: SwipeChoice) => {
    const profile = profiles[currentIndex];
    const nextLikedProfiles = choice === "like" ? [...likedProfiles, profile] : likedProfiles;
    const nextIndex = currentIndex + 1;

    setLikedProfiles(nextLikedProfiles);

    if (nextIndex >= profiles.length) {
      setCurrentIndex(nextIndex);
      setStage(getNextStage(nextLikedProfiles.length));
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const handlePickWinner = (profile: Profile) => {
    setWinner(profile);
    setStage("winner");
  };

  return (
    <div className="app-shell" style={themeStyleVars}>
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <div className="ambient ambient--three" />

      <main className="app-frame">
        {stage === "intro" && (
          <section className="hero-card">
            <p className="eyebrow">dating app parody</p>
            <h1>{copy.appTitle}</h1>
            <p className="hero-card__lead">{copy.appTagline}</p>

            <div className="hero-card__stats">
              <div>
                <span>Анкет</span>
                <strong>{profiles.length}</strong>
              </div>
              <div>
                <span>Формат</span>
                <strong>Свайп + финал</strong>
              </div>
            </div>

            {!hasProfiles && (
              <div className="inline-notice">
                <strong>{copy.emptyProfilesTitle}</strong>
                <p>{copy.emptyProfilesText}</p>
              </div>
            )}

            {issues.length > 0 && (
              <div className="inline-notice inline-notice--warning">
                <strong>
                  {copy.invalidProfilesTitle}: {issues.length}
                </strong>
                <p>{copy.invalidProfilesText}</p>
              </div>
            )}

            <button className="action-button action-button--primary hero-card__button" onClick={startFlow}>
              {copy.startButton}
            </button>
          </section>
        )}

        {stage === "browse" && currentProfile && (
          <SwipeDeck
            profile={currentProfile}
            currentIndex={currentIndex}
            total={profiles.length}
            onChoice={handleChoice}
          />
        )}

        {stage === "no-matches" && (
          <section className="state-card state-card--centered">
            <p className="eyebrow">final verdict</p>
            <h1>{copy.noMatchesTitle}</h1>
            <p>{copy.noMatchesText}</p>
            <button className="action-button action-button--primary" onClick={restartFlow}>
              {copy.restart}
            </button>
          </section>
        )}

        {stage === "finalists" && (
          <section className="state-card finalists-stage">
            <div className="section-header">
              <div>
                <p className="eyebrow">top picks only</p>
                <h1>{copy.finalistsTitle}</h1>
              </div>
              <p>{copy.finalistsText}</p>
            </div>

            <div className="finalists-grid">
              {likedProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  mode="pick"
                  onClick={() => handlePickWinner(profile)}
                />
              ))}
            </div>
          </section>
        )}

        {stage === "winner" && winner && (
          <section className="state-card winner-stage">
            <div className="sparkles" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p className="eyebrow">grand finale</p>
            <h1>{copy.winnerTitle}</h1>
            <p>{copy.winnerText}</p>
            <div className="winner-stage__crown" aria-hidden="true">
              crown
            </div>
            <ProfileCard profile={winner} mode="winner" />
            <button className="action-button action-button--primary" onClick={restartFlow}>
              {copy.restart}
            </button>
          </section>
        )}

        {stage === "empty" && (
          <section className="state-card state-card--centered">
            <p className="eyebrow">content missing</p>
            <h1>{copy.emptyProfilesTitle}</h1>
            <p>{copy.emptyProfilesText}</p>

            {issues.length > 0 && (
              <div className="issues-box">
                <h2>{copy.invalidProfilesTitle}</h2>
                <ul>
                  {issues.map((issue) => (
                    <li key={`${issue.file}-${issue.reason}`}>
                      <strong>{issue.file}</strong>: {issue.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="action-button action-button--ghost" onClick={() => setStage("intro")}>
              {copy.startOver}
            </button>
          </section>
        )}

        {issues.length > 0 && stage !== "empty" && (
          <aside className="issues-box issues-box--floating">
            <h2>{copy.invalidProfilesTitle}</h2>
            <ul>
              {issues.map((issue) => (
                <li key={`${issue.file}-${issue.reason}`}>
                  <strong>{issue.file}</strong>: {issue.reason}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>
    </div>
  );
}
