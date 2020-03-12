/*
教师管理
wangwenjun
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import FileUploader from '@/components/FileUploader';
import { getItemCourseTreeByItemIds } from '@/actions/base';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
import { message } from "antd/lib/index";
import {
  checkLoginNameUnique
} from '@/actions/teaching';

import AreasSelect from '@/components/AreasSelect';


const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const { TextArea } = Input;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};


/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class TeacherCreateView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      realName: "",
      partner_list: [],
      checkedKeys: split(props.currentDataModel.categoryIds).map((item) => { return 'second:' + item }),
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      courseTreeNodes: [],
      mobile:'',
      isopen: false,
      entryYear: props.currentDataModel.entryYear || ''
    };
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    if (this.state.dataModel.itemIds != undefined) {
      this.fetchCourseList(this.state.dataModel.itemIds);
    }
  }

  //检索项目课程（启用）
  fetchCourseList = (itemIds) => {
    var condition = { ids: itemIds, }
    if (itemIds == '') {
      this.setState({ courseTreeNodes: [] });
      return;
    }
    this.props.getItemCourseTreeByItemIds(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        //构造树结构
        let nodes = [];
        let allNodes = [];
        data.data.map((courseInfo, index) => {
          let { itemId, itemName } = courseInfo;
          var firstNode = nodes.find(a => a.value == `${itemId}`);
          if (!firstNode) {
            firstNode = { name: itemName, value: `${itemId}`, key: `first:${itemId}`, child: [], depth: 1 };
            nodes.push(firstNode);
            allNodes.push(firstNode);
          }
          courseInfo.courseCategories = courseInfo.courseCategories.filter(a => a.isMain)
          courseInfo.courseCategories.map((courseCategory, index) => {
            let { courseCategoryId, name } = courseCategory;
            var secondNode = firstNode.child.find(a => a.value == `${courseCategoryId}`);
            if (!secondNode) {
              secondNode = { name: name, value: `${courseCategoryId}`, key: `second:${courseCategoryId}`, child: [], depth: 2, };
              firstNode.child.push(secondNode);
              allNodes.push(secondNode);
            }
          })

        })
        this.setState({ courseTreeNodes: nodes, allTreeNodes: allNodes })
      }
    })
  }

  //项目->课程树
  renderTree(menus) {
    if (!menus) { return null };
    let { searchValue } = this.state;
    return menus.map((item) => {
      let subMenu = item.child;
      let childs = this.renderTree(subMenu);

      const index = item.name.indexOf(searchValue);
      const beforeStr = item.name.substr(0, index);
      const afterStr = item.name.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.name}</span>;

      return <TreeNode title={title} key={item.key} dataItem={item} isLeaf={item.child.length == 0}>{childs}</TreeNode>
    })
  }

  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      
      if (!err) {

        if(!this.state.entryYear){
            message.error('请选择入职年份！');
            return;
        }

        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据
        if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
          values.entryYear = this.state.entryYear;
          if(values.teacherNo){
              this.props.checkLoginNameUnique({ loginName: values.teacherNo, userId: this.state.dataModel.teacherId }).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error('此教师号已存在，请核对后再试！');
                    return;
                }else{

                  var postData = {
                    teacherId: this.state.dataModel.teacherId,
                    categoryIds: this.state.checkedKeys.filter(a => a.indexOf('second:') != -1).map(a => a.split(':')[1]).join(',') == "" ? this.state.dataModel.categoryIds : this.state.checkedKeys.filter(a => a.indexOf('second:') != -1).map(a => a.split(':')[1]).join(','),
                    avatar: values.avatar == "" ? this.state.dataModel.avatar : values.avatar,
                  }
                  
                  if (Array.isArray(values.areaId)) {
                    values.areaId = values.areaId[values.areaId.length - 1];
                  }

                  values.itemIds = values.itemIds.toString();
                  this.props.viewCallback({ ...values, ...postData, });//合并保存数据

                }
            })
          }else{
            var postData = {
              teacherId: this.state.dataModel.teacherId,
              categoryIds: this.state.checkedKeys.filter(a => a.indexOf('second:') != -1).map(a => a.split(':')[1]).join(',') == "" ? this.state.dataModel.categoryIds : this.state.checkedKeys.filter(a => a.indexOf('second:') != -1).map(a => a.split(':')[1]).join(','),
              avatar: values.avatar == "" ? this.state.dataModel.avatar : values.avatar,
            }
            
            if (Array.isArray(values.areaId)) {
              values.areaId = values.areaId[values.areaId.length - 1];
            }

            values.itemIds = values.itemIds.toString();
            this.props.viewCallback({ ...values, ...postData, });//合并保存数据
          }

          
        }
        
      }
    });
  }

  onCheck = (checkedKeys, info) => {
    this.setState({ checkedKeys: checkedKeys })
  }
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys: expandedKeys,
      autoExpandParent: false,
    });
  }


  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
      op = getViewEditModeTitle(this.props.editMode);
      return `${op}教师`;
    }
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = this.props.editMode == 'EditDate' ? getViewEditModeTitle('Edit') : getViewEditModeTitle(this.props.editMode)
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >

        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
      </FormItem>
    }
    else {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
    }
  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "Create":
      case "Edit":
        let block_funTree = this.renderTree(this.state.courseTreeNodes);
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="教师姓名"
                >
                  {getFieldDecorator('realName', {
                    initialValue: dataBind(this.state.dataModel.realName),
                    rules: [{
                      required: true, message: '请输入教师姓名!',
                    }],
                  })(
                    <Input placeholder="请输入教师姓名"/>
                    )}
                </FormItem>
              </Col>
              {
                this.props.editMode == 'Edit' ? this.state.dataModel.teacherNo ? <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="教师号"
                    >
                      { this.state.dataModel.teacherNo }
                    </FormItem>
                  </Col>
                  : ''
                  : ''
              }

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="英文名"
                >
                  {getFieldDecorator('englishName', {
                    initialValue: dataBind(this.state.dataModel.englishName)
                  })(
                    <Input placeholder="请输入英文名"/>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="手机号"
                >
                  {getFieldDecorator('mobile', {
                    initialValue: dataBind(this.state.dataModel.mobile),
                    rules: [{
                      required: true, message: '请输入手机号!'},
                      {
                        validator: (rule, value, callback) => {
                          //const form = this.props.form;
                          var regex = /^[1][3,4,5,7,8][0-9]{9}$/;
                          if (!regex.test(value)) {
                            callback('不是有效的手机号！')
                          } else {
                            callback();
                          }
                        }
                    }],
                  })(
                    <Input placeholder="请输入手机号"/>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所在城市">
                  {getFieldDecorator('areaId', {
                    initialValue: dataBind(this.state.dataModel.areaId),
                    rules: [{ required: true, message: '请选择城市!' }],
                    })(
                      <AreasSelect
                        value={this.state.dataModel.areaId}
                        areaName={this.state.dataModel.areaName}
                      />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={<span><b style={{color:'red'}}>*</b>入职年份</span>}>
                        <DatePicker 
                          value={this.state.entryYear ? moment(timestampToTime(new Date(this.state.entryYear,0).getTime()),'YYYY') : ''}
                          style={{width: '200px'}}
                          placeholder='入职年份' 
                          open={this.state.isopen} mode="year" format="YYYY" 
                          onFocus={() => {this.setState({isopen: true})}} 
                          onBlur={() => {this.setState({isopen: false})}} 
                          onPanelChange={(v) => {
                            this.setState({
                              entryYear: formatMoment(v,'YYYY'),
                              isopen: false
                            })
                          }}
                        />
                    </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="授课方式"
                >
                  {getFieldDecorator('teachingMode', {
                    initialValue: dataBind(this.state.dataModel.teachingMode),
                    rules: [{
                      required: true, message: '请选授课方式!',
                    }],
                  })(
                    <Select onChange={(value, option) => {
                      this.setState({ teacher_teaching_mode: value })
                    }}>
                      <Option value=''>--请选择--</Option>
                      {this.props.teacher_teaching_mode.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>

                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="状态"
                >
                  {getFieldDecorator('teachingStatus', {
                    initialValue: dataBind(this.state.dataModel.teachingStatus),
                    rules: [{
                      required: true, message: '请选状态!',
                    }],
                  })(
                    <Select onChange={(value, option) => {
                      this.setState({ teaching_status: value })
                    }}>
                      <Option value=''>--请选择--</Option>
                      {this.props.teaching_status.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>

                    )}
                </FormItem>
              </Col>
              
              <Col span={24} >
                <FormItem
                  {...searchFormItemLayout24}
                  label="项目"
                >
                  {getFieldDecorator('itemIds',
                    {
                      initialValue: this.state.dataModel.itemIds ? dataBind(split(this.state.dataModel.itemIds)) : '',
                      rules: [{
                        required: true, message: '请选择用项目!',
                      }],
                    })(
                    <SelectItem scope='all' hideAll={false}
                      showCheckBox={true}
                      onSelectChange={(value) => {
                        this.fetchCourseList(value);
                      }} />
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}

                  label="科目列表"
                >
                  {block_funTree.length > 0 && getFieldDecorator('courseIds',
                    {
                      initialValue: '',
                      rules: [{
                        required: true, message: '请选择科目!',
                        validator: (rule, value, callback) => {
                          if (this.state.checkedKeys.length == 0) {
                            callback('请选择科目')
                          }
                          else {
                            callback();
                          }
                        }
                      }],
                    })(
                    <Tree
                      checkable
                      autoExpandParent={this.state.autoExpandParent}
                      checkedKeys={this.state.checkedKeys}
                      expandedKeys={this.state.expandedKeys}
                      onCheck={this.onCheck}
                      onExpand={this.onExpand}
                    >
                      {block_funTree}
                    </Tree>
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label='头像'>
                  {getFieldDecorator('avatar', {
                    initialValue: '',
                  })(
                    <FileUploader />
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="能力"
                >
                  {getFieldDecorator('ability', {
                    initialValue: dataBind(this.state.dataModel.ability),
                    rules: [{
                      required: false, message: '请输入教师能力!',
                    }],
                  })(
                    <Input />
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="教学风格"
                >
                  {getFieldDecorator('teachingStyle', {
                    initialValue: dataBind(this.state.dataModel.teachingStyle),
                    rules: [{
                      required: false, message: '请输入教师教学风格!',
                    }],
                  })(
                    <Input />
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="简介"
                >
                  {getFieldDecorator('introduce', {
                    initialValue: dataBind(this.state.dataModel.introduce),
                    rules: [{
                      required: false, message: '请输入教师简介!',
                    }],
                  })(
                    <TextArea rows={4} />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;

    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        <div className="dv_split"></div>
        {block_editModeView}
        <div className="dv_split"></div>
      </ContentBox>
    );
  }
}

const WrappedTeacherCreateView = Form.create()(TeacherCreateView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    getItemCourseTreeByItemIds: bindActionCreators(getItemCourseTreeByItemIds, dispatch),
    checkLoginNameUnique: bindActionCreators(checkLoginNameUnique, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeacherCreateView);
