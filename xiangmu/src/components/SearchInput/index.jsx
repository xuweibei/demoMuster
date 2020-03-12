import React from 'react'
import { Select } from 'antd';

const Option = Select.Option;

//---Select 自动补全和远程数据结合。
//import jsonp from 'fetch-jsonp';
//import querystring from 'querystring';
//---end

let timeout;
let currentValue;

/*function fetch(value, callback) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  function fake() {
    const str = querystring.encode({
      parentId: '',
      orgName: value,
    });
    jsonp(`http://192.168.0.212:8080/edu/organization/queryBranchByOrgId?${str}`)
      .then(response => response.json())
      .then((d) => {
        if (currentValue === value) {
          const result = d.result;
          const data = [];
          result.forEach((r) => {
            data.push({
              value: r[0],
              text: r[0],
            });
          });
          callback(data);
        }
      });
  }

  timeout = setTimeout(fake, 300);
}*/


export default class SearchInput extends React.Component {

  constructor(props) {
    super(props);
    this.state= {
      data: [],
      title: '',
      value: props.value,
    };
    (this: any).handleChange = this.handleChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('title' in nextProps) {
      this.setState({
        value: nextProps.value,
        title: nextProps.title,
      });
    }
  }
  handleSearch = (title) => {
    var that = this;
    console.log(title);
    this.setState({title: title});
    if(title){
      this.props.searchInputHandleChange(title, function(data){
        if(data && data.length == 1 && data[0].value == ""){
          that.setState({ data: [] });
        }else {
          that.setState({ data });
        }
      })
    }
  }
  handleChange = (value) => {
    //this.setState({ value });
    //fetch(value, data => this.setState({ data }));
    var that = this;
    for(var i = 0; i < this.state.data.length; i++){
      var _i = this.state.data[i];
      if(_i.value == value){
        that.setState({title: _i.title, value: _i.value});
        this.props.setChooseValueChange(value);
        return;
      }
    }
    this.props.setChooseValueChange('');
  }
  render() {
    const options = this.state.data.map(d => <Option key={d.value}>{d.title}</Option>);
    return (
      <Select
        mode="combobox"
        //value={this.state.title || this.props.initialValue}
        value={this.state.title }
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onChange={this.handleChange}
        onSearch={this.handleSearch}
      >
        {options}
      </Select>
    );
  }
}
