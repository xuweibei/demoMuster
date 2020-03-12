/*
  资料管理 - 查看
*/
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber, message } from 'antd';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
const { TextArea } = Input;
import {
  queryMaterialVoList
} from '@/actions/material';

const FormItem = Form.Item;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};
const dateFormat = 'YYYY-MM-DD';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class MaterialManageView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      realName:'',
      certificateNo:'',
      studentNo:'',
      data: [],
      totalAmount:0,
      pagingSearch: {
          currentPage: 1,
          pageSize: 10,
      },
    };
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
      this.loadBizDictionary(['express']);
      if (this.props.editMode == 'View') {
        this.onSearch();
      }
      
  }


  onCheck = (checkedKeys, info) => {
    this.setState({ checkedKeys: checkedKeys })
  };
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys: expandedKeys,
      autoExpandParent: false,
    });
  };

  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.materialId = this.state.dataModel.materialId;
    this.props.queryMaterialVoList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          ...data.data.childMaterials,
          dataModel: data.data,
          loading: false,
          pagingSearch: condition
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
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
            if (this.props.editMode == 'Edit') {
                values.sendDate = formatMoment(values.sendDate);
                values.studentId = this.props.currentDataModel.studentId;
                values.courseId = this.props.currentDataModel.courseId;
                values.orderId = this.props.currentDataModel.orderId;
                values.courseActiveId = this.props.currentDataModel.courseActiveId;
                values.courseCategoryId = this.props.currentDataModel.courseCategoryId;
                values.itemId = this.props.currentDataModel.itemId;
                values.branchId = this.props.currentDataModel.branchId;
                values.orderCourseProductId = this.props.currentDataModel.orderCourseProductId;
                values.courseProductId = this.props.currentDataModel.courseProductId;
                this.props.viewCallback({ studentMaterialId: this.state.dataModel.studentMaterialId, ...values });//合并保存数据
            }
            if (this.props.editMode == 'SetPatch') {
                this.props.viewCallback({ studentMaterialIds: this.state.dataModel.studentMaterialIds.join(','), ...values })
            }
            
           
        }
    });
}

  //标题
  getTitle() {
      let op = '';
      if (this.props.editMode == 'SetPatch') {
          op = '学生网课讲义批量设置'
      }
    
      if (this.props.editMode == 'Edit') {
          op = '学生优播网课资料领取信息编辑'
      }
      if (this.props.editMode == 'View') {
          op = '资料详细信息'
      }

      return `${op}`;
  }
  //表单按钮处理
  renderBtnControl() {
      if (this.props.editMode != 'View') {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>确定</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
    }
    return <FormItem
      className='btnControl'
      {...btnsearchFormItemLayout}
    >

      <Button onClick={this.onCancel} icon="rollback">返回</Button>
    </FormItem>
  }

  viewColumns = [
    {
        title: '序号',
        width: 50,
        fixed: 'left',
        render: (text, record, index) => {
          return <span>{index+1}</span>
        }
    },
    {
        title: '资料名称',
        width: 220,
        dataIndex: 'materialName'
    },
    {
        title: '项目',
        dataIndex: 'itemName',
        width:100,
    },
    {
        title: '科目',
        dataIndex: 'courseCategoryName',
        width:100,
    },
    {
        title: '课程',
        dataIndex: 'courseName',
    },
    {
        title: '资料类型',
        width: 100,
        dataIndex: 'materialType',
    },
    {
        title: '状态',
        width: 80,
        dataIndex: 'materialStatus',
    },
    {
        title: '外购',
        width: 80,
        dataIndex: 'isOutside',
    },
    {
        title: '创建人',
        width:120,
        dataIndex: 'founder',
    },
    {
        title: '最新修改人',
        width:120,
        dataIndex: 'modifier',
    },
    {
        title: '最新修改日期',
        fixed: 'right',
        width:120,
        dataIndex: 'modifyDate',
        render: (text, record, index) => {
            return timestampToTime(record.modifyDate);
        }
    },
  ];

  renderDataViewTable = () => {
    return (<div>
      {/* 内容分割线 */}
      <div className="search-result-list" style={{padding:'0 20px'}}>
        <div className="space-default"></div>
        <p style={{paddingBottom:20}}>包含子资料信息:</p>
        <Table columns={this.viewColumns} //列定义
          loading={this.state.loading}
          pagination={false}
          dataSource={this.state.data}//数据
          bordered
          scroll={{ x: 1400 }}
        />
        <div className="space-default"></div>
          <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                  <Col span={24} className='search-paging-control'>
                      <Pagination showSizeChanger
                          current={this.state.pagingSearch.currentPage}
                          defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                          onShowSizeChange={this.onShowSizeChange}
                          onChange={this.onPageIndexChange}
                          showTotal={(total) => { return `共${total}条数据`; }}
                          total={this.state.totalRecord} />
                  </Col>
              </Row>
          </div>
      </div>
    </div>
    )
  }
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "View":
        block_content = (
          <Form>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="资料名称"
              >
                {this.state.dataModel.materialName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="状态"
              >
                {this.state.dataModel.materialStatus}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="资料类型"
              >
                {this.state.dataModel.materialType}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="是否外购"
              >
                {this.state.dataModel.isOutside}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="是否打包资料"
              >
                {this.state.dataModel.isPack}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="教师"
              >
                {this.state.dataModel.teacher}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="所属项目"
              >
                {this.state.dataModel.itemName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="所属科目"
              >
                {this.state.dataModel.courseCategoryName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="所属课程"
              >
                {this.state.dataModel.courseName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="附件"
              >
                {
                  this.state.dataModel.materialFile ? <div style={{ marginBottom: 10 }}><FileDownloader
                      apiUrl={'/edu/file/getFile'}//api下载地址
                      method={'post'}//提交方式
                      options={{ filePath:this.state.dataModel.materialFile }}
                      title={'下载附件'}
                    >
                    </FileDownloader>
                  </div>
                  : '暂无'
                }
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="说明"
              >
                {this.state.dataModel.remark}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="创建人"
              >
                {this.state.dataModel.founder}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="创建日期"
              >
                {this.state.dataModel.createDate}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="最后修改人"
              >
                {this.state.dataModel.modifier}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="最后修改日期"
              >
                {this.state.dataModel.modifyDate}
              </FormItem>
            </Col>
          </Row>
          {this.renderDataViewTable()}
        </Form>
        );
        break;
      case "SetPatch":
          var title = "您共选择了" + `${this.state.dataModel.studentMaterialIds.length}` + "条网课领取信息进行批量修改";
          block_content = (
              <Form>
                  <Row>
                    <Col span={24}>
                      <FormItem
                          {...searchFormItemLayout}
                          label={title}
                      >
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="快递名称"
                      >
                        {getFieldDecorator('express', {
                          initialValue: '',
                          rules: [{
                              required: true, message: '请选择快递名称!',
                          }],
                        })(
                          <Select style={{width:220}}>
                            <Option value=''>--请选择--</Option>
                            {this.state.express.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>

                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="快递日期">
                        {getFieldDecorator('sendDate', {
                                initialValue: '',
                                rules: [{
                                    required: true, message: '请选择快递日期!',
                                }],
                            })(
                                <DatePicker
                                  format={dateFormat}
                                  placeholder='快递日期'
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="快递编号"
                      >
                        {getFieldDecorator('expressNum', {
                          initialValue: '',
                        })(
                          <Input placeholder='请输入快递编号' />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="快递地址"
                      >
                        {getFieldDecorator('sendAddress', {
                          initialValue: '',
                        })(
                          <Input placeholder='请输入快递地址' />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="收件人"
                      >
                        {getFieldDecorator('receiver', {
                          initialValue: '',
                        })(
                          <Input placeholder='请输入收件人' />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="收件人电话"
                      >
                        {getFieldDecorator('receiverMobile', {
                          initialValue: '',
                        })(
                          <Input placeholder='请输入收件人电话' />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={24}>
                      <FormItem
                        {...searchFormItemLayout24}
                        style={{ paddingRight: 18 }}
                        label="备注"
                      >
                        {getFieldDecorator('sendRemark', {
                          initialValue: '',
                        })(
                          <TextArea　placeholder='请填写备注' rows={3} />
                          )}
                      </FormItem>
                    </Col>
                  </Row>

              </Form>
          )
        break;
        case "Edit":
                block_content = (
                    <Form >
                        <Row>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="分部"
                            >
                              {this.state.dataModel.orgName}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="教学点"
                            >
                              {this.state.dataModel.techCenterName}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="学生姓名"
                            >
                              {this.state.dataModel.realName}
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
                              label="订单号"
                            >
                              {this.state.dataModel.orderSn}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="学籍情况"
                            >
                              {this.state.dataModel.studyMsg}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="课程名称"
                            >
                              {this.state.dataModel.courseName}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="所属课程商品"
                            >
                              {this.state.dataModel.productName}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="是否赠送"
                            >
                              {this.state.dataModel.giveMsg}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="是否允许重修"
                            >
                              {this.state.dataModel.rehearMsg}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="激活状态"
                            >
                              {this.state.dataModel.activeMsg}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="激活日期"
                            >
                              {timestampToTime(this.state.dataModel.activeTime)}
                            </FormItem>
                          </Col>



                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="快递名称"
                            >
                              {getFieldDecorator('express', {
                                initialValue: this.state.dataModel.express,
                                rules: [{
                                    required: true, message: '请选择快递名称!',
                                }],
                              })(
                                <Select>
                                  <Option value=''>--请选择--</Option>
                                  {this.state.express.map((item, index) => {
                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                  })}
                                </Select>

                                )}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                              <FormItem {...searchFormItemLayout} label="快递日期">
                              {getFieldDecorator('sendDate', {
                                      initialValue: dataBind(timestampToTime(this.state.dataModel.sendDate),true),
                                      rules: [{
                                          required: true, message: '请选择快递日期!',
                                      }],
                                  })(
                                      <DatePicker
                                        format={dateFormat}
                                        placeholder='快递日期'
                                      />
                                  )}
                              </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="快递编号"
                            >
                              {getFieldDecorator('expressNum', {
                                initialValue: this.state.dataModel.expressNum,
                              })(
                                <Input placeholder='请输入快递编号' />
                                )}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="快递地址"
                            >
                              {getFieldDecorator('sendAddress', {
                                initialValue: this.state.dataModel.sendAddress,
                              })(
                                <Input placeholder='请输入快递地址' />
                                )}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="收件人"
                            >
                              {getFieldDecorator('receiver', {
                                initialValue: this.state.dataModel.receiver,
                              })(
                                <Input placeholder='请输入收件人' />
                                )}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="收件人电话"
                            >
                              {getFieldDecorator('receiverMobile', {
                                initialValue: this.state.dataModel.receiverMobile,
                              })(
                                <Input placeholder='请输入收件人电话' />
                                )}
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem
                              {...searchFormItemLayout24}
                              style={{ paddingRight: 18 }}
                              label="备注"
                            >
                              {getFieldDecorator('receiveRemark', {
                                initialValue: this.state.dataModel.receiveRemark,
                              })(
                                <TextArea　placeholder='请填写备注' rows={3} />
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

const WrappedMaterialManageView = Form.create()(MaterialManageView);

const mapStateToProps = (state) => {
  //基本字典数据
  let {Dictionarys} = state.dic;
  let { realName } = state.auth.currentUser.user;
  return { Dictionarys, realName };
};
function mapDispatchToProps(dispatch) {
  return {
    queryMaterialVoList: bindActionCreators(queryMaterialVoList, dispatch),
    // loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };

}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMaterialManageView);
