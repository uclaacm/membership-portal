import React from "react";
import PropTypes from "prop-types";
import Loader from "components/Loader";

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.buttonAction = this.buttonAction.bind(this);
  }

  buttonAction(e) {
    const { loading, onClick } = this.props;
    if (!loading && onClick) {
      onClick(e);
    }
  }

  render() {
    const { className, color, icon, customIcon, loading, style, text, type } = this.props;
    const buttonClass = `button-component ${className}`;
    const buttonIcon = icon ? <i className={`fa ${icon} button-icon`} aria-hidden="true" /> : null;
    const buttonCustomIcon = customIcon ? <img src={customIcon} className="button-icon button-custom-icon" /> : null;
    return (
      <div className={buttonClass} onClick={this.buttonAction}>
        <button className={`${style} ${color} button-inside`} type={type}>
          {!loading && buttonIcon && !buttonCustomIcon}
          {!loading && buttonCustomIcon}
          {!loading && <span>{text}</span>}
          {loading && <Loader />}
        </button>
      </div>
    );
  }
}

Button.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.string,
  text: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["button", "submit"]),
};

Button.defaultProps = {
  className: null,
  color: null,
  icon: null,
  loading: false,
  onClick: () => {},
  style: null,
  type: "button",
};

export default Button;
