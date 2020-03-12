import React from 'react';
import { Input, Tooltip, InputNumber } from 'antd';



export default class NumericInput extends React.Component {
  onChange = (e) => {
    const value  = e + '';
    var reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if(this.props.type == "int"){
      reg = /^([1-9][0-9]*)$/;
    }
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      this.props.onChange(value);
    }
  }
  formatNumber = (value) => {
    value += '';
    const list = value.split('.');
    const prefix = list[0].charAt(0) === '-' ? '-' : '';
    let num = prefix ? list[0].slice(1) : list[0];
    let result = '';
    while (num.length > 3) {
      result = `,${num.slice(-3)}${result}`;
      num = num.slice(0, num.length - 3);
    }
    if (num) {
      result = num + result;
    }
    return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
  }
  // '.' at the end or only '-' in the input box.
  onBlur = () => {
    var { value, onBlur, onChange } = this.props;
    value += '';
    if(value){
      if (value.charAt(value.length - 1) === '.' || value === '-') {
        onChange({ value: value.slice(0, -1) });
      }
      if (onBlur) {
        onBlur();
      }
    }
  }
  render() {
    const { value } = this.props;
    const title = value ? (
      <span className="numeric-input-title">
        {value !== '-' ? this.formatNumber(value) : '-'}
      </span>
    ) : this.props.placeholder || '';
    return (
      <Tooltip
        //trigger={['focus']}
        title={title}
        placement="topLeft"
        //overlayClassName="numeric-input"
      >
        <InputNumber
          {...this.props}
          onChange={this.onChange}
          onBlur={this.onBlur}
          placeholder={this.props.placeholder || ''}
          maxLength="25"
          precision={2}
          style={{ width: '120px' }}
        />
      </Tooltip>
    );
  }
}
