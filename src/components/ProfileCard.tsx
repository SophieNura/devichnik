import ReactMarkdown from "react-markdown";
import { copy } from "../config/copy";
import type { Profile } from "../types";

type ProfileCardProps = {
  profile: Profile;
  mode?: "browse" | "pick" | "winner";
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  celebrate?: boolean;
};

export function ProfileCard({
  profile,
  mode = "browse",
  style,
  className,
  onClick,
  celebrate = false,
}: ProfileCardProps) {
  const clickable = typeof onClick === "function";
  const primaryFacts = [
    { label: copy.profileFields.hobbies, value: profile.hobbies.join(", ") },
    { label: copy.profileFields.occupation, value: profile.occupation },
    { label: copy.profileFields.style, value: profile.style },
  ];
  const secondaryFacts = [
    { label: copy.profileFields.pets, value: profile.pets },
    { label: copy.profileFields.worstAct, value: profile.worstAct },
  ];

  return (
    <article
      className={["profile-card", `profile-card--${mode}`, clickable ? "is-clickable" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="profile-card__media-wrap">
        <img
          className="profile-card__media"
          src={profile.imageUrl}
          alt={profile.name}
          loading={mode === "browse" ? "eager" : "lazy"}
          decoding="async"
        />
        <div className="profile-card__sheen" />
      </div>

      {celebrate && (
        <div className="profile-card__celebration" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      <div className="profile-card__content">
        <div className="profile-card__headline">
          <p className="eyebrow">кандидат</p>
          <h2>{profile.name}</h2>
        </div>

        <div className="profile-card__details">
          <dl className="profile-card__facts">
            {primaryFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="profile-card__secondary">
            <dl className="profile-card__facts profile-card__facts--compact">
              {secondaryFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="profile-card__about markdown-body">
              <p className="profile-card__section-title">{copy.profileFields.about}</p>
              <ReactMarkdown>{profile.about}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
