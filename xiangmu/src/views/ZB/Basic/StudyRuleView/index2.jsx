
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox,Popconfirm  } from 'antd';

import './index.less'

import { getDictionaryTitle, getViewEditModeTitle, dataBind, split } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';

//业务接口方法引入
import { getStudyRuleList, editStudyRule, addStudyRule, deleteStudyRule } from '@/actions/base';
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const EditableContext = React.createContext();
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i.toString(),
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
class EditableCell extends React.Component {
  getInput = () => {
    if(this.props.dataIndex == 'courseCategoryBeginNum'){
        if (!this.props.record.courseCategoryEndNum) {
            return `${this.props.record.courseCategoryBeginNum}科及以上`
        }
        else {
            return <div><InputNumber min={1} step={1} defaultValue={this.props.record.courseCategoryBeginNum} />至<InputNumber  min={1} step={1} defaultValue={this.props.record.courseCategoryEndNum} /></div>
        }
    }
    if (this.props.inputType === 'number') {
        console.log(this.props.record)
      return <InputNumber  min={0} step={0.5} initialValue={this.props.record.studyPeriod/12}/>;
    }
  };
  render() {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: true,
                      message: `请输入${title}!`,
                    }],
                    initialValue: record[dataIndex]/12,
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

class StudyRuleView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data, editingKey: '' };
    this.state = {
        dataModel: props.currentDataModel,//数据模型
        dataLength: props.currentDataModel.length,
        editingKey: '1'
    };
    this.columns = [
      {
            title: '科目数(包含)',
            width: 280,
            fixed: 'left',
            editable: true,
            dataIndex: 'courseCategoryBeginNum',
            // render: (text, record, index) => {
            //     if (!record.courseCategoryEndNum) {
            //         return `${record.courseCategoryBeginNum}科及以上`
            //     }
            //     else {
            //         return <div><InputNumber min={1} step={1} defaultValue={record.courseCategoryBeginNum} />至<InputNumber  min={1} step={1} defaultValue={record.courseCategoryEndNum} /></div>
            //     }
            // }
        },
        {
            title: '学籍长度(年)',
            dataIndex: 'studyPeriod',
            editable: true,
            // render: (text, record, index) => {
            //     return <InputNumber min={0} step={0.5} defaultValue={record.studyPeriod/12} />
            // }
        },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <a
                        href="javascript:;"
                        onClick={() => this.save(form, record.key)}
                        style={{ marginRight: 8 }}
                      >
                        Save
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="Sure to cancel?"
                    onConfirm={() => this.cancel(record.key)}
                  >
                    <a>Cancel</a>
                  </Popconfirm>
                </span>
              ) : (
                <a onClick={() => this.edit(record.key)}>Edit</a>
              )}
            </div>
          );
        },
      },
    ];
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  edit(key) {
    this.setState({ editingKey: key });
  }
  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.dataModel];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.setState({ data: newData, editingKey: '' });
      } else {
        newData.push(data);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }
  cancel = () => {
    this.setState({ editingKey: '' });
  };
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: 'number',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: true,
        }),
      };
    });

    return (
      <Table
        components={components}
        bordered
        dataSource={this.state.dataModel}
        columns={columns}
        rowClassName="editable-row"
      />
    );
  }
}


const WrappedStudyRuleView = Form.create()(StudyRuleView);
export default WrappedStudyRuleView;
