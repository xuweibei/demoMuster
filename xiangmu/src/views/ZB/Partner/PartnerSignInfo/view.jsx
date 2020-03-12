
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import { getItemCourseTreeByItemIds } from '@/actions/base';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
import { message } from "antd/lib/index";
import {
  partnerSignSelectById
} from '@/actions/partner';

import AreasSelect from '@/components/AreasSelect';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const { TextArea } = Input;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};
const searchFormItemLayout17 = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};
const searchFormItemLayout14 = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;


/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class PartnerSignInfoCreateView extends React.Component {
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
    
    if (this.state.dataModel.partnerSignId != undefined) {
      this.fetchPartnerSignInfo(this.state.dataModel.partnerSignId);
    }

  }

  fetchPartnerSignInfo = (partnerSignId) => {
    this.props.partnerSignSelectById({partnerSignId:partnerSignId}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      let itemIds = [],itemNames = [];
      data.data.contractPriceList.map((item) => {
        itemIds.push(item.itemId);
        itemNames.push(item.itemName);
        item.child = [];
      })


      data.data.itemIds = itemIds.join(',');
      data.data.itemNames = itemNames.join(',');

      this.setState({
        dataModel: data.data,
        courseTreeNodes: data.data.contractPriceList
      })

      this.fetchCourseList(itemIds.join(','));

    })
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
            firstNode = { itemName: itemName, itemId: `${itemId}`, child: [] };

            let agreementPriceList = [{
              agreementAmount: '',
              courseCategoryIdList: []
            }];

            this.state.courseTreeNodes.filter(a => a.itemId == itemId).map((item) => {
              agreementPriceList = item.agreementPriceList;
            })
            

            firstNode.agreementPriceList = agreementPriceList;
            
            nodes.push(firstNode);
            allNodes.push(firstNode);
          }
          courseInfo.courseCategories = courseInfo.courseCategories.filter(a => a.isMain);

          let priceList = firstNode.agreementPriceList;

          priceList.map(item => {

            let labelList = item.courseCategoryIdList;
            let list = [],isArr = true;
            for(let i=0;i<labelList.length;i++){
              if(typeof(labelList[i]) == 'string'){
                let courseCategory = courseInfo.courseCategories.filter(a => a.courseCategoryId == labelList[i]);
                let obj = {};
                obj.key = labelList[i];
                obj.label = courseCategory[0].name;
                list.push(obj);
                isArr = false;
              }
            }
            if(!isArr){
              item.courseCategoryIdList = list;
            }
            

          })

          

          courseInfo.courseCategories.map((courseCategory, index) => {
            let { courseCategoryId, name } = courseCategory;
            var secondNode = firstNode.child.find(a => a.value == `${courseCategoryId}`);
            if (!secondNode) {
              secondNode = { name: name, value: `${courseCategoryId}` };
              firstNode.child.push(secondNode);
              allNodes.push(secondNode);
            }
          })

        })

        this.setState({ courseTreeNodes: nodes, allTreeNodes: allNodes })
      }
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

          values.signDate = formatMoment(values.signDate);
          let startDate = values.startDate;
          if(startDate){
            values.startDate = formatMoment(startDate[0])
            values.endDate = formatMoment(startDate[1])
          }

          let universityId = values.universityId;
          if(Array.isArray(universityId) && universityId[0]){
              values.universityId = universityId[0].id;
              values.universityName = universityId[0].name;
          }

          if (Array.isArray(values.areaId)) {
            values.areaId = values.areaId[values.areaId.length - 1];
          }

          let contractPriceList = [];
          this.state.courseTreeNodes.map((item) => {
            let list = {};
            list.itemId = item.itemId;
            list.agreementPriceListStr = [];
            item.agreementPriceList.map((priceList,j) => {
              let obj = {};
              obj.agreementAmount = priceList.agreementAmount;
              obj.courseCategoryIdListStr = [];
              priceList.courseCategoryIdList.map((courseCategoryIdList,i) => {

                obj.courseCategoryIdListStr.push(courseCategoryIdList.key);
                delete values[`courseCategoryIds${list.itemId}${i}`];

              })
              obj.courseCategoryIdListStr = obj.courseCategoryIdListStr.join(',');
              list.agreementPriceListStr.push(obj);
              delete values[`agreementAmount${list.itemId}${j}`];
            })
            contractPriceList.push(list)
          })

          values.contractPriceListStr = JSON.stringify(contractPriceList);
          if(this.props.editMode == 'Edit'){
            values.partnerSignId = this.state.dataModel.partnerSignId;
          }

          this.props.viewCallback({ ...values });//合并保存数据

          
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

  getItemList = (value) => {

    let searchList = this.props.dic_Roles.filter( a => a.title.indexOf(value) > -1 );
    
    this.setState({
        all_roles: searchList,
    })
        
}
//新增
onCreate = (index,key) => {
  let data = this.state.courseTreeNodes;
  data[index].agreementPriceList.push({
    agreementAmount: '',
    courseCategoryIdList: []
  })
  // this.props.form.resetFields();
  this.setState({
    courseTreeNodes: data,
  })
}
//删除
onDeltet = (index,key) => {
    let data = this.state.courseTreeNodes;
    data[index].agreementPriceList.map((item,i) => {
      this.props.form.resetFields([`courseCategoryIds${data[index].itemId}${i}`]);
      this.props.form.resetFields([`agreementAmount${data[index].itemId}${i}`]);
    })
    data[index].agreementPriceList.splice(key,1);
    this.setState({
      courseTreeNodes: data,
    })
}

//设置协议价格
changeAgreementAmount = (value,index,key) => {
  let data = this.state.courseTreeNodes;
  data[index].agreementPriceList[key].agreementAmount = value;
  this.setState({
    courseTreeNodes: data,
  })
}

//设置签约科目
changeCourseCategoryIds = (value,index,key) => {
  let data = this.state.courseTreeNodes;
  data[index].agreementPriceList[key].courseCategoryIdList = value[0];
  this.setState({
    courseTreeNodes: data,
  })
}


  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
      op = getViewEditModeTitle(this.props.editMode);
      return `${op}大客户签约信息`;
    }else{
      return `查看大客户签约信息`;
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
    let title = this.getTitle();
    switch (this.props.editMode) {
      case "Create":
      case "Edit":
        
        block_content = (
          <Form>
            <ContentBox titleName={title} hideBottomBorder={true}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="合同编号"
                  >
                    {getFieldDecorator('contactNo', {
                      initialValue: dataBind(this.state.dataModel.contactNo),
                      rules: [{
                        required: true, message: '请输入合同编号!',
                      }],
                    })(
                      <Input placeholder="请输入合同编号"/>
                      )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="落款签章"
                  >
                    {getFieldDecorator('signature', {
                      initialValue: dataBind(this.state.dataModel.signature),
                      rules: [{
                        required: true, message: '请输入落款签章!',
                      }],
                    })(
                      <Input placeholder="请输入落款签章"/>
                      )}
                  </FormItem>
                </Col>
            </Row>
            <div className="dv_split"></div>
            </ContentBox>
            <ContentBox titleName='大客户签约信息' hideBottomBorder={true}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="高校名称"
                >
                  {getFieldDecorator('universityId', {
                    initialValue: !this.state.dataModel.universityId?[]:[{
                      id:this.state.dataModel.universityId,
                      name:this.state.dataModel.universityName
                  }],
                    rules: [{
                      required: true, message: '请输入高校名称!',
                    }],
                  })(
                    <EditableUniversityTagGroup maxTags={1} 
                      onChange={(value) => {
                          // if (value.length > 0) {
                          //     let id = value[0].id
                          //     this.fetchCampusList(id);
                          // }
                          // else {
                          //     this.setState({ dic_Campus: [] })
                          // }
                          setTimeout(() => {
                              this.props.form.resetFields(['departmentName']);
                          }, 500);
                      }} 
                    />
                    )}
                </FormItem>
              </Col>
              
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学院名称"
                >
                  {getFieldDecorator('departmentName', {
                    initialValue: dataBind(this.state.dataModel.departmentName),
                    rules: [{
                      required: true, message: '请输入学院名称!',
                    }],
                  })(
                    <Input placeholder="请输入学院名称"/>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="签约主体" >
                      {getFieldDecorator('zbPayeeType', { 
                        initialValue: dataBind(this.state.dataModel.zbPayeeType),
                        rules: [{ required: true, message: '请选择签约主体!' }],
                       })(
                          <Select>
                              <Option value="">--请选择--</Option>
                              {this.props.pos_account_type.filter(a => a.value == 1 || a.value == 2).map((item, index) => {
                                  return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                          </Select>
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="合作状态">
                  {getFieldDecorator('cooperationStatus', {
                    initialValue: dataBind(this.state.dataModel.cooperationStatus),
                    rules: [{ required: true, message: '请选择合作状态!' }],
                  })(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {this.props.cooperation_status.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="所属分公司">
                      {getFieldDecorator('branchId', {
                          initialValue: dataBind(this.state.dataModel.branchId),
                          rules: [{ required: true, message: '请选择所属分公司!' }],
                      })(
                          <SelectFBOrg scope={'my'} hideAll={true} />
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
                <FormItem {...searchFormItemLayout} label="合同类型">
                  {getFieldDecorator('contractType', {
                    initialValue: dataBind(this.state.dataModel.contractType),
                    rules: [{ required: true, message: '请选择合同类型!' }],
                  })(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {this.props.contract_type.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="是否排他"
                >
                  {getFieldDecorator('isExclusive', {
                    initialValue: dataBind(this.state.dataModel.isExclusive),
                    rules: [{
                      required: true, message: '请选择是否排他!',
                    }],
                  })(
                    <Select>
                      <Option value=''>--请选择--</Option>
                      {this.props.dic_YesNo.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>

                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                      {...searchFormItemLayout}
                      label="签约日期"
                  >
                      {getFieldDecorator('signDate', {
                          initialValue: dataBind(timestampToTime(this.state.dataModel.signDate), true),
                          rules: [{
                              required: true, message: '请选择签约日期!',
                          }],
                      })(
                          <DatePicker
                              placeholder='签约日期'
                              format={dateFormat}
                          />
                          )}
                  </FormItem>
              </Col>
              <Col span={12} >
                <FormItem
                    {...searchFormItemLayout}
                    label="有效期">
                    {getFieldDecorator('startDate', { 
                      initialValue:this.state.dataModel.startDate?[dataBind(timestampToTime(this.state.dataModel.startDate), true),dataBind(timestampToTime(this.state.dataModel.endDate), true)]:[],
                      rules: [{
                        required: true, message: '请设置有效期!',
                      }],
                    })(
                        <RangePicker style={{width:220}}/>
                    )}
                </FormItem>
              </Col>
              
            </Row>
            <div className="dv_split"></div>
          </ContentBox>
          <ContentBox titleName='结算信息' hideBottomBorder={true}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="学校提成"
                  >
                    {getFieldDecorator('schoolRoyalty', {
                      initialValue: dataBind(this.state.dataModel.schoolRoyalty),
                      rules: [{
                        required: true, message: '请输入学校提成!',
                      }],
                    })(
                      <Input placeholder="请输入学校提成"/>
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="个人提成"
                  >
                    {getFieldDecorator('persionRoyalty', {
                      initialValue: dataBind(this.state.dataModel.persionRoyalty),
                    })(
                      <Input placeholder="请输入个人提成"/>
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="结算期限"
                  >
                    {getFieldDecorator('settlement', {
                      initialValue: dataBind(this.state.dataModel.settlement),
                    })(
                      <Input placeholder="请输入结算期限"/>
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="保证金或押金"
                  >
                    {getFieldDecorator('deposit', {
                      initialValue: dataBind(this.state.dataModel.deposit),
                      rules: [{
                        required: true, message: '请输入保证金或押金!',
                      }],
                    })(
                      <Input placeholder="请输入保证金或押金"/>
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="违约金"
                  >
                    {getFieldDecorator('falsify', {
                      initialValue: dataBind(this.state.dataModel.falsify),
                    })(
                      <Input placeholder="请输入违约金"/>
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="奖学金"
                  >
                    {getFieldDecorator('scholarship', {
                      initialValue: dataBind(this.state.dataModel.scholarship),
                    })(
                      <Input placeholder="请输入奖学金"/>
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="是否开具发票"
                >
                  {getFieldDecorator('isInvoice', {
                    initialValue: dataBind(this.state.dataModel.isInvoice),
                    rules: [{
                      required: true, message: '请选择是否开具发票（或收据）!',
                    }],
                  })(
                    <Select style={{width: '60%'}}>
                      <Option value=''>--请选择--</Option>
                      {this.props.dic_YesNo.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                  )}
                  &nbsp;&nbsp;(或收据)
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="收费方">
                  {getFieldDecorator('payeeType', {
                      initialValue: dataBind( this.state.dataModel.payeeType),
                      rules: [{ required: true, message: '请选择收费方!' }],
                    })(
                      <Select>
                        <Option value="">--请选择--</Option>
                        {
                          this.props.payee_type.filter(a => a.value != 5).map((item, index) => {
                            return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                      </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                  <FormItem
                      {...searchFormItemLayout24}
                      label="修改约定"
                  >
                      {getFieldDecorator('modifyAppoint', {
                          initialValue: this.state.dataModel.modifyAppoint,
                      })(
                          <TextArea rows={4} />
                          )}
                  </FormItem>
              </Col>
              <Col span={24}>
                  <FormItem
                      {...searchFormItemLayout24}
                      label="特别事项"
                  >
                      {getFieldDecorator('specialMatter', {
                          initialValue: this.state.dataModel.specialMatter,
                      })(
                          <TextArea rows={4} />
                          )}
                  </FormItem>
              </Col>
            </Row>
            <div className="dv_split"></div>
          </ContentBox>
          <ContentBox titleName='学员缴费信息' bottomButton={this.renderBtnControl()}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="分期情况">
                    {getFieldDecorator('periodizationType', {
                        initialValue: dataBind( this.state.dataModel.periodizationType),
                        rules: [{ required: true, message: '请选择分期情况!' }],
                      })(
                        <Select>
                          <Option value="">--请选择--</Option>
                          {
                            this.props.periodization_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                        </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="实际收费方">
                    {getFieldDecorator('actualPayeeType', {
                        initialValue: dataBind( this.state.dataModel.actualPayeeType),
                        rules: [{ required: true, message: '请选择实际收费方!' }],
                      })(
                        <Select>
                          <Option value="">--请选择--</Option>
                          {
                            this.props.payee_type.filter(a => a.value != 5).map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                        </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={24} >
                  <FormItem
                    {...searchFormItemLayout24}
                    label="合同价格"
                  >
                    {getFieldDecorator('itemIds',
                      {
                        initialValue: this.state.dataModel.itemIds ? dataBind(split(this.state.dataModel.itemIds)) : '',
                        rules: [{
                          required: true, message: '请选择合同价格!',
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
                {
                  this.state.courseTreeNodes.map((item,index) => {
                    return <Col span={24} >
                      <FormItem
                        {...searchFormItemLayout24}
                        label={item.itemName}
                      >
                      {
                        item.agreementPriceList.map((list,key) => {
                          return <Row gutter={24} style={{width:'100%',marginBottom:'20px'}}>
                                    <Col span={12} >
                                      <FormItem
                                        {...searchFormItemLayout17}
                                        label="签约科目"
                                      >
                                        {getFieldDecorator('courseCategoryIds'+`${item.itemId}${key}`, {
                                            initialValue:  (list.courseCategoryIdList.length && typeof(list.courseCategoryIdList[0]) != 'string') ? list.courseCategoryIdList : [],
                                            rules: [{
                                                required: true, message: '请选择签约科目!',
                                            }],
                                        })(
                                            <Select
                                                mode="multiple"
                                                labelInValue
                                                placeholder="请选择签约科目"
                                                style={{marginBottom:'20px'}}
                                                filterOption={false}
                                                // onSearch={this.getItemList}
                                                onChange={(...arg) => { this.changeCourseCategoryIds(arg,index,key) }}
                                            >
                                                {item.child.map((itemChild, index) => {
                                                    let isSelect = false;
                                                    item.agreementPriceList.map((category,i) => {
                                                      if(key != i){
                                                        if(category.courseCategoryIdList.filter(a=>a.key == itemChild.value).length){
                                                          isSelect = true;
                                                        }
                                                      }
                                                    })
                                                    if(isSelect){
                                                      return <Option disabled value={itemChild.value} key={index}>{itemChild.name}</Option>
                                                    }
                                                    return <Option value={itemChild.value} key={index}>{itemChild.name}</Option>
                                                    
                                                })}
                                            </Select>
                                        )}
                                      </FormItem>
                                    </Col>
                                    <Col span={8} >
                                      <FormItem
                                        {...searchFormItemLayout14}
                                        label="协议价格"
                                      >
                                        {getFieldDecorator('agreementAmount'+`${item.itemId}${key}`,
                                          {
                                            initialValue: list.agreementAmount,
                                            rules: [{
                                              required: true, message: '请输入协议价格!',
                                            }],
                                          })(
                                            <InputNumber min={0} step={1} onChange={(...arg) => { this.changeAgreementAmount(...arg,index,key) }}/>
                                          )}
                                      </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        {
                                          key == 0 ? <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='plus' onClick={() => { this.onCreate(index,key); }}></Icon> 
                                          : <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='close' onClick={() => { this.onDeltet(index,key); }}></Icon>
                                        }
                                        
                                    </Col>
                                </Row>
                        })
                      }
                      
                        
                      </FormItem>
                    </Col>
                  }) 
                }
                
            </Row>
            
            <div className="dv_split"></div>
          </ContentBox>
          </Form>
        );
        break;
      case "View":

        block_content = (
          <Form>
            <ContentBox titleName={title} hideBottomBorder={true}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="合同编号"
                  >
                    {this.state.dataModel.contactNo}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="落款签章"
                  >
                    {this.state.dataModel.signature}
                  </FormItem>
                </Col>
            </Row>
            <div className="dv_split"></div>
            </ContentBox>
            <ContentBox titleName='大客户签约信息' hideBottomBorder={true}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="高校名称"
                >
                  {this.state.dataModel.universityName}
                </FormItem>
              </Col>
              
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学院名称"
                >
                  {this.state.dataModel.departmentName}
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="签约主体" >
                      {getDictionaryTitle(this.props.pos_account_type,this.state.dataModel.zbPayeeType)}
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="合作状态">
                  {getDictionaryTitle(this.props.cooperation_status,this.state.dataModel.cooperationStatus)}
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="所属分公司">
                      {this.state.dataModel.branchName}
                  </FormItem>
              </Col>
              
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所在城市">
                  {this.state.dataModel.areaName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="合同类型">
                  {getDictionaryTitle(this.props.contract_type,this.state.dataModel.contractType)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="是否排他"
                >
                  {getDictionaryTitle(this.props.dic_YesNo,this.state.dataModel.isExclusive)}
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                      {...searchFormItemLayout}
                      label="签约日期"
                  >
                      {timestampToTime(this.state.dataModel.signDate)}
                  </FormItem>
              </Col>
              <Col span={12} >
                <FormItem
                    {...searchFormItemLayout}
                    label="有效期">
                    {
                      timestampToTime(this.state.dataModel.startDate)+'-'+timestampToTime(this.state.dataModel.endDate)
                    }
                </FormItem>
              </Col>
              
            </Row>
            <div className="dv_split"></div>
          </ContentBox>
          <ContentBox titleName='结算信息' hideBottomBorder={true}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="学校提成"
                  >
                    {this.state.dataModel.schoolRoyalty}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="个人提成"
                  >
                    {this.state.dataModel.persionRoyalty}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="结算期限"
                  >
                    {this.state.dataModel.settlement}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="保证金或押金"
                  >
                    {this.state.dataModel.deposit}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="违约金"
                  >
                    {this.state.dataModel.falsify}
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="奖学金"
                  >
                    {this.state.dataModel.scholarship}
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="是否开具发票"
                >
                  {getDictionaryTitle(this.props.dic_YesNo,this.state.dataModel.isInvoice)}
                  &nbsp;&nbsp;(或收据)
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="收费方">
                  {getDictionaryTitle(this.props.payee_type,this.state.dataModel.payeeType)}
                </FormItem>
              </Col>
              <Col span={24}>
                  <FormItem
                      {...searchFormItemLayout24}
                      label="修改约定"
                  >
                      {this.state.dataModel.modifyAppoint}
                  </FormItem>
              </Col>
              <Col span={24}>
                  <FormItem
                      {...searchFormItemLayout24}
                      label="特别事项"
                  >
                      {this.state.dataModel.specialMatter}
                  </FormItem>
              </Col>
            </Row>
            <div className="dv_split"></div>
          </ContentBox>
          <ContentBox titleName='学员缴费信息' bottomButton={this.renderBtnControl()}>
            <div className="dv_split"></div>
            <Row gutter={24} style={{ width: "100%" }}>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="分期情况">
                    {getDictionaryTitle(this.props.periodization_type,this.state.dataModel.periodizationType)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="实际收费方">
                    {getDictionaryTitle(this.props.payee_type,this.state.dataModel.actualPayeeType)}
                  </FormItem>
                </Col>
                <Col span={24} >
                  <FormItem
                    {...searchFormItemLayout24}
                    label="合同价格"
                  >
                    {this.state.dataModel.itemNames}
                  </FormItem>
                </Col>
                {
                  this.state.courseTreeNodes.map((item,index) => {
                    return <Col span={24} >
                      <FormItem
                        {...searchFormItemLayout24}
                        label={item.itemName}
                      >
                      {
                        item.agreementPriceList.map((list,key) => {
                          return <Row gutter={24} style={{width:'100%',marginBottom:'20px'}}>
                                    <Col span={12} >
                                      <FormItem
                                        {...searchFormItemLayout17}
                                        label="签约科目"
                                      >
                                        {getFieldDecorator('courseCategoryIds'+`${item.itemId}${key}`, {
                                            initialValue:  (list.courseCategoryIdList.length && typeof(list.courseCategoryIdList[0]) != 'string') ? list.courseCategoryIdList : [],
                                            rules: [{
                                                required: true, message: '请选择签约科目!',
                                            }],
                                        })(
                                            <Select
                                                mode="multiple"
                                                labelInValue
                                                placeholder="请选择签约科目"
                                                style={{marginBottom:'20px'}}
                                                filterOption={false}
                                                disabled
                                                onChange={(...arg) => { this.changeCourseCategoryIds(arg,index,key) }}
                                            >
                                                {item.child.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.name}</Option>
                                                })}
                                            </Select>
                                        )}
                                      </FormItem>
                                    </Col>
                                    <Col span={8} >
                                      <FormItem
                                        {...searchFormItemLayout14}
                                        label="协议价格"
                                      >
                                        {getFieldDecorator('agreementAmount'+`${item.itemId}${key}`,
                                          {
                                            initialValue: list.agreementAmount,
                                            rules: [{
                                              required: true, message: '请输入协议价格!',
                                            }],
                                          })(
                                            <InputNumber min={0} step={1} disabled onChange={(...arg) => { this.changeAgreementAmount(...arg,index,key) }}/>
                                          )}
                                      </FormItem>
                                    </Col>
                                    {/* <Col span={4}>
                                        {
                                          key == 0 ? <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='plus' onClick={() => { this.onCreate(index,key); }}></Icon> 
                                          : <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='close' onClick={() => { this.onDeltet(index,key); }}></Icon>
                                        }
                                        
                                    </Col> */}
                                </Row>
                        })
                      }
                      
                        
                      </FormItem>
                    </Col>
                  }) 
                }
                
            </Row>
            
            <div className="dv_split"></div>
          </ContentBox>
          </Form>
        );

      break;
    }
    return block_content;
  }

  render() {
    let block_editModeView = this.renderEditModeOfView();
    return (
        block_editModeView
    );
  }
}

const WrappedPartnerSignInfoCreateView = Form.create()(PartnerSignInfoCreateView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    getItemCourseTreeByItemIds: bindActionCreators(getItemCourseTreeByItemIds, dispatch),
    partnerSignSelectById: bindActionCreators(partnerSignSelectById, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPartnerSignInfoCreateView);
