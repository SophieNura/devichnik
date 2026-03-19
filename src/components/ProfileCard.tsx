import ReactMarkdown from "react-markdown";
import { copy } from "../config/copy";
import type { Profile } from "../types";

type ProfileCardProps = {
  profile: Profile;
  mode?: "browse" | "pick" | "winner";
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
};

export function ProfileCard({
  profile,
  mode = "browse",
  style,
  className,
  onClick,
}: ProfileCardProps) {
  const clickable = typeof onClick === "function";

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

      <div className="profile-card__content">
        <div className="profile-card__headline">
          <p className="eyebrow">кандидат</p>
          <h2>{profile.name}</h2>
        </div>

        <dl className="profile-card__facts">
          <div>
            <dt>{copy.profileFields.hobbies}</dt>
            <dd>{profile.hobbies.join(", ")}</dd>
          </div>
          <div>
            <dt>{copy.profileFields.occupation}</dt>
            <dd>{profile.occupation}</dd>
          </div>
          <div>
            <dt>{copy.profileFields.style}</dt>
            <dd>{profile.style}</dd>
          </div>
          <div>
            <dt>{copy.profileFields.pets}</dt>
            <dd>{profile.pets}</dd>
          </div>
          <div>
            <dt>{copy.profileFields.worstAct}</dt>
            <dd>{profile.worstAct}</dd>
          </div>
        </dl>

        <div className="profile-card__about markdown-body">
          <p className="profile-card__section-title">{copy.profileFields.about}</p>
          <ReactMarkdown>{profile.about}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
