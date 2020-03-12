/*
教师查看
wangwenjun
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber,Avatar,Badge } from 'antd';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';

import { getItemCourseTreeByItemIds } from '@/actions/base';
import {message} from "antd/lib/index";
import { env } from '@/api/env';
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class TeacherInfoView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      realName:"",
      partner_list: [],
      checkedKeys:split(props.currentDataModel.categoryIds).map((item)=>{return 'second:'+item}),
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      courseTreeNodes: [],
      mobile:'',
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
    var condition = {ids: itemIds,}
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

          courseInfo.courseCategories.map((courseCategory , index) => {
            let { courseCategoryId, name } = courseCategory;
            var secondNode = firstNode.child.find(a => a.value == `${courseCategoryId}`);
            if (!secondNode) {
              secondNode = { name: name, value: `${courseCategoryId}`, key: `second:${courseCategoryId}`, child: [], depth: 2 };
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
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据
        if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
          console.log(values.avatar)
          var postData = {
            teacherId:this.state.dataModel.teacherId,
            categoryIds:this.state.checkedKeys.filter(a => a.indexOf('second:') != -1).map(a => a.split(':')[1]).join(',')== ""?this.state.dataModel.categoryIds:this.state.checkedKeys.filter(a => a.indexOf('second:') != -1).map(a => a.split(':')[1]).join(','),
            avatar:values.avatar==""?this.state.dataModel.avatar:values.avatar,
          }
        }
      this.props.viewCallback({ ...values, ...postData, });//合并保存数据
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
    }else{
      return '查看教师详细信息';
    }

  }
  //表单按钮处理
  renderBtnControl() {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "View":
        let block_funTree = this.renderTree(this.state.courseTreeNodes);
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                  <FormItem
                      {...searchFormItemLayout}
                      label="英文名"
                  >
                      {this.state.dataModel.englishName}
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="教师号"
                >
                    {this.state.dataModel.teacherNo}
                </FormItem>
              </Col>
              
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="手机号"
                >
                    {this.state.dataModel.mobile}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="所在城市"
                >
                    {this.state.dataModel.areaName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="入职年份"
                >
                    {this.state.dataModel.entryYear}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="授课方式"
                >
                    {getDictionaryTitle(this.props.teacher_teaching_mode, this.state.dataModel.teachingMode)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="状态"
                >
                    {getDictionaryTitle(this.props.teaching_status, this.state.dataModel.teachingStatus)}
                </FormItem>
              </Col>
              <Col span={12} >
               <FormItem
                    {...searchFormItemLayout}
                    label="项目"
                >
                    {this.state.dataModel.itemNames}
                </FormItem>
              </Col>
              <Col span={12}>
                    <FormItem {...searchFormItemLayout} label='头像'>
                        {getFieldDecorator('avatar', {
                            initialValue: '',
                        })(
                          <Avatar shape="square" size="large" icon="user" src={env.serverURL+this.state.dataModel.avatar}/>
                            )}
                    </FormItem>
                
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="能力"
                >
                    {this.state.dataModel.ability}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="教学风格"
                >
                    {this.state.dataModel.teachingStyle}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                    {...searchFormItemLayout24}
                    label="简介"
                >
                    {this.state.dataModel.introduce}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}

                  label="课程列表"
                >
                  {block_funTree.length > 0 && <Tree
                    autoExpandParent={this.state.autoExpandParent}
                    checkedKeys={this.state.checkedKeys}
                    expandedKeys={this.state.expandedKeys}
                    onCheck={this.onCheck}
                    onExpand={this.onExpand}
                  >
                    {block_funTree}
                  </Tree>
                  }
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

const WrappedTeacherInfoView = Form.create()(TeacherInfoView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    getItemCourseTreeByItemIds: bindActionCreators(getItemCourseTreeByItemIds, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeacherInfoView);
