 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, DatePicker
} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
const dateFormat = 'YYYY-MM-DD';

import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24,onSearch} from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, formatMoment, timestampToTime,convertTextToHtml } from '@/utils';

import { loadDictionary } from '@/actions/dic'; 
import { DataCollectionSingle,EditAndDeleteInterfaces } from '@/actions/base';
import moment from 'moment';
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class Detail extends React.Component {
    constructor(props) {
        super(props)

        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = {
            dataModel: { ...props.dataModel },
          webCourseList:[],
          faceCourseList:[],
          user: {}, 
        };
    }
    componentWillMount() {
      //载入需要的字典项
      this.loadBizDictionary([ 'category_state','dic_sex','express']);  
        // this.fetch()
        this.onSearch()
    }
    fetch = () => {  
      this.props.DataCollectionSingle({ studentMaterialId:this.props.currentDataModel.studentMaterialId}).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {  
          this.setState({  
            dataModel: data.data, 
          })
        }
        else { 
          message.error(data.message);
        }
      });
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    //标题
    getTitle() { 
        return `学生资料领取编辑`;
    }
    onSubmit = () => {
      var that = this;
      //表单验证后，合并数据提交
      this.props.form.validateFields((err, values) => {
          if (!err) {
              let condition = {...values};  
              condition.studentId = this.props.currentDataModel.studentId;
              condition.courseId = this.props.currentDataModel.courseId;
              condition.orderId = this.props.currentDataModel.orderId;
              condition.courseActiveId = this.props.currentDataModel.courseActiveId;
              condition.courseCategoryId = this.props.currentDataModel.courseCategoryId;
              condition.itemId = this.props.currentDataModel.itemId;
              condition.branchId = this.props.currentDataModel.branchId;
              condition.orderCourseProductId = this.props.currentDataModel.orderCourseProductId;
              condition.courseProductId = this.props.currentDataModel.courseProductId; 
              condition.delFlag = null;
              condition.receiveDate = formatMoment(condition.receiveDate)
              condition.studentMaterialId = this.props.currentDataModel.studentMaterialId;
              this.props.EditAndDeleteInterfaces(condition).payload.promise.then((response)=>{
                let data = response.payload.data; 
                  if(data.state=='success'){
                    this.props.viewCallback()
                  }else{
                    message.error(data.msg)
                  }
              })
            }
          }
        )
    }
    //表单按钮处理
    renderBtnControl() {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button><span className="split_button"></span><Button onClick={this.onCancel} icon="rollback">返回</Button>
        </FormItem>
    }  
    render() {   
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
            switch (this.props.editMode) {
                case "Edit":
                    block_content = (
                      <Form>
                          <Row gutter={24}>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '学生姓名'
                                  >
                                    {
                                      this.state.dataModel.realName
                                    }
                                  </FormItem>
                              </Col> 
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '手机号'
                                  >
                                  {
                                    this.state.dataModel.mobile
                                  }
                                  </FormItem>
                              </Col>
                              <Col span={24}>
                                  <FormItem
                                  {...searchFormItemLayout24}
                                  label = '主要商品'
                                  > 
                                  {
                                    this.state.dataModel.productNames
                                  }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '订单号'
                                  > 
                                  {
                                    this.state.dataModel.orderSn
                                  }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '资料名称'
                                  > 
                                  {
                                    this.state.dataModel.materialName
                                  }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '资料类型'
                                  > 
                                  {
                                    this.state.dataModel.materialType
                                  }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '是否打包资料'
                                  > 
                                  {
                                    this.state.dataModel.isPack
                                  }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '教师'
                                  > 
                                  {
                                    this.state.dataModel.teacher
                                  }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '领取方式'
                                  >
                                    {
                                      getFieldDecorator('receiveWay',{
                                         initialValue:this.state.dataModel.receiveWay==0?'':this.state.dataModel.receiveWay,
                                         rules: [{
                                          required: true, message: '请选择领取方式!',
                                        }]
                                        })( 
                                       <Select>
                                         <Option value=''>全部</Option>
                                         <Option value='1'>自取</Option>
                                         <Option value='2'>代领</Option>
                                         <Option value='3'>邮寄</Option>
                                       </Select>
                                      )
                                    }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '领取人'
                                  >
                                    {
                                      getFieldDecorator('receiver',{ 
                                        initialValue:this.state.dataModel.receiver,
                                        rules: [{
                                          required: true, message: '请输入领取人!',
                                        }]
                                      })( 
                                        <Input />
                                      )
                                    }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '领取日期'
                                  >
                                    {
                                      getFieldDecorator('receiveDate',{ 
                                        initialValue:this.state.dataModel.receiveDate?moment(timestampToTime(this.state.dataModel.receiveDate),dateFormat):'',
                                        rules: [{
                                          required: true, message: '请选择领取日期!',
                                        }]
                                      })( 
                                        <DatePicker
                                            style={{width: '200px'}} 
                                            format={dateFormat} 
                                        />
                                      )
                                    }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '快递公司'
                                  >
                                    {
                                      getFieldDecorator('express',{ initialValue:this.state.dataModel.express})( 
                                        <Select>
                                          <Option value=''>全部</Option>
                                          {
                                            this.state.express.map(item=>{
                                              return <Option value={item.value}>{item.title}</Option>
                                            })
                                          }
                                        </Select>
                                      )
                                    }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '快递地址'
                                  >
                                    {
                                      getFieldDecorator('sendAddress',{ initialValue:this.state.dataModel.sendAddress})( 
                                        <Input />
                                      )
                                    }
                                  </FormItem>
                              </Col> 
                              <Col span={24}>
                                  <FormItem
                                  {...searchFormItemLayout24}
                                  label = '备注'
                                  >
                                    {
                                      getFieldDecorator('receiveRemark',{ initialValue:this.state.dataModel.receiveRemark})( 
                                        <TextArea/>
                                      )
                                    }
                                  </FormItem>
                              </Col>
                          </Row> 
                        </Form>
                    );
                    break;
            }

        return (
            <div>
                {!this.state.showList && <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                }
                {this.state.showList &&
                    <Row>
                        <Col span={24} className="center">
                            <Button onClick={() => {
                                this.setState({ showList: false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
                }
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(Detail);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      //列表
      DataCollectionSingle: bindActionCreators(DataCollectionSingle, dispatch),
      //编辑
      EditAndDeleteInterfaces: bindActionCreators(EditAndDeleteInterfaces, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
