export function NoAddons(props: { message: string }) {
  return (
    <div className="vx-addons-empty-wrapper">
      <div className="vx-addons-empty">
        <img draggable={false} src="/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg" />
        <div className="vx-addons-empty-text">
          {props.message}
        </div>
      </div>
    </div>
  )
};