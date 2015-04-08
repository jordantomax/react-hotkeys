import React from 'react';

const FocusTrap = React.createClass({

  propTypes: {
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    focusName: React.PropTypes.string // Currently unused
  },

  render() {
    return (
      <div tabIndex="0" {...this.props}>
        {this.props.children}
      </div>
    );
  }

});

export default FocusTrap;