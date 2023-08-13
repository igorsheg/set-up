import * as React from "react";

type Props = {
  handleJoin: (name: string) => void;
};

export default function Join(props: Props): React.ReactElement {
  const [value, setValue] = React.useState<string>("");
  const { handleJoin } = props;

  return (
    <form className="join">
      <input
        onChange={(e): void => setValue(e.target.value)}
        value={value}
        placeholder="Enter a username"
        required
      />
      <button
        type="submit"
        onClick={(e): void => {
          if (e.currentTarget.form && e.currentTarget.form.checkValidity()) {
            e.preventDefault();
            handleJoin(value);
            setValue("");
          }
        }}
      >
        Join
      </button>
    </form>
  );
}
