import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { css } from "../../styled-system/css";
import { GlobalStateContext } from "../state/contextProvider";

const inputStyles = {
  display: "inline-block",
  verticalAlign: "middle",
  fontSize: "4vw",
  fontWeight: 300,
  padding: "3vw 6vw",
  marginBottom: "9vw",
  color: "#7A828A",
  border: ".5px solid #CED4DA",
  backgroundColor: "#fff",
  boxShadow: "1.8px 2.4px 1.8px rgba(0, 0, 0, 0.05)",
  md: {
    marginBottom: "3rem",
    fontSize: "1.1rem",
    padding: "0.8rem 1.6rem",
  },
  _focus: {
    outline: 0,
    border: "1px solid #BDEAFE",
  },
};

const formContainerStyles = css({
  display: "flex",
  justifyContent: "center",
  boxSizing: "border-box",
});

const formStyles = css({
  display: "flex",
  flexFlow: "row wrap",
  alignItems: "center",
});

const hiddenLabelStyles = css({
  display: "none !important",
});

const formGroupStyles = css({
  flex: "0 0 auto",
});

const buttonStyles = css({
  ...inputStyles,
  borderRadius: "0 .3rem .3rem 0",
  textAlign: "center",
  _active: {
    boxShadow: "1.8px 2.4px 1.8px rgba(0, 0, 0, 0.05)",
  },
});

const textInputStyles = css({
  ...inputStyles,
  textAlign: "left",
  borderRadius: ".3rem 0 0 .3rem",
  _placeholder: {
    color: "#7A828A",
  },
  _focus: {
    _placeholder: {
      color: "#AAB0B5",
    },
  },
});
export function ScreenNameInput() {
  const [input, setInput] = useState("");
  const { socket } = useContext(GlobalStateContext);
  const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    setInput(value);
  return (
    <div className={formContainerStyles}>
      <form
        className={formStyles}
        id="screenName"
        name="screenName"
        autoComplete="off"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          socket.send(
            JSON.stringify({
              type: "newPlayerEvent",
              screenName: input,
            })
          );
        }}
      >
        <label className={hiddenLabelStyles} htmlFor="enter-screen-name">
          Enter screen name
        </label>
        <div className={formGroupStyles}>
          <input
            className={textInputStyles}
            placeholder="Enter screen name to start"
            onChange={handleChange}
            type="text"
            id="enter-screen-name"
            name="screenName"
            autoFocus
            value={input}
          />
          <button type="submit" value="Go" className={buttonStyles}>
            Go
          </button>
        </div>
      </form>
    </div>
  );
}
