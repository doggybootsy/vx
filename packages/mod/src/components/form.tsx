import "./form.css";

interface FormBodyProps {
  children: React.ReactNode,
  title: React.ReactNode,
  description?: React.ReactNode
};

export function FormBody(props: FormBodyProps) {
  return (
    <div className="vx-form-body">
      <h3 className="vx-form-title">{props.title}</h3>
      {props.description && (
        <div className="vx-form-description">
          {props.description}
        </div>
      )}
      {props.children}
    </div>
  )
}