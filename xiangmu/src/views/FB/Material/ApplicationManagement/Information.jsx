 
//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col,DatePicker, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item; 

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//业务接口方法引入 
import { DetailsOfInformation } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory'; 
import ChangeDetailInfoIndex from './changeDetailInfoIndex';
import Info from './info';  
//学生详情  
import EditableTeacher from '@/components/EditableTeacher';
 
class StudentStudyInfo  extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      teacherInfo:[],
      UserSelecteds:[],
      sureList:[],
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        materialType:'', 
        materialStatus: '',
        itemId: '',
        courseCategoryId:'',
        materialName: '',
        isPack:'',  
        isOutside:'', 
        teacher: '',
        materialId: '', 
      },
      data: [],
      totalRecord: 0, 
      loading: false, 
    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode', 'category_state','student_change_status','dic_YesNo','material_type']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    this.onSearch(); 
  }  
  componentWillUnMount() {
  }  
  //table 输出列定义
  columns = [
    {
      title: "资料名称",
      width: 180,
      fixed: 'left',
      dataIndex: 'materialName'
    },
    {
      title: '项目',
      dataIndex: 'itemName', 
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName'
    },
    {
      title: '资料类型',
      dataIndex: 'materialType',
    },
    {
      title: '打包资料',
      dataIndex: 'isPack',
    },
    {
      title: '外购',
      dataIndex: 'isOutside', 
    },
    {
      title: '教师',
      dataIndex: 'teacher', 
    }, 
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => {
        //编辑   适用商品 互斥设置(2)
        return  <Button onClick={() => { this.onLookView('ViewInfo', record); }}>查看</Button> 
      },
    }]; 

  //检索数据
  fetch = (params = {}) => {
   
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;  
    let onOff = false;
    if(Array.isArray(condition.teacherId)&&condition.teacherId[0]){
      condition.teacher =  condition.teacherId[0].id
      onOff = true;
      delete condition.teacherId
    }else{
      condition.teacher = ''
    }
    let arr = [];
    if(this.props.webCourseList){
      this.props.webCourseList.forEach(item=>{
        arr.push(item.materialId)
      })
    } 
    condition.subMaterialIds = arr.join(',') || '';
 
    this.props.DetailsOfInformation(condition).payload.promise.then((response) => {
      let data = response.payload.data; 
      if (data.state === 'success') {
        
        var teacherInfo = []; 
        if(onOff){
          teacherInfo.push({
              id: condition.teacher,
              name: data.data[0].teacher
          }) 
        } 
        this.setState({ 
          pagingSearch: condition,
          data: data.data,
          totalRecord: data.totalRecord,
          loading: false,
          teacherInfo
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }

  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      this.onSearch();
      this.onLookView("Manage", null);
    }
  }

  onSubmit = () => {
    var that = this;
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
        if (!err) {   
              this.props.viewCallback('Edit',this.state.sureList); 
              this.props.viewCallback('Create',this.state.sureList); 
              this.setState({
                sureList:[]
              })
        }
    });
}

  //渲染，根据模式不同控制不同输出
  render() {

    const { getFieldDecorator } = this.props.form; 
    let block_content = <div></div>
    switch (this.state.editMode) {   
      case "ViewInfo":
        block_content = <Info viewCallback={this.onViewCallback} {...this.state} />
        break;
      case "Create":
      case "Receipt":
        block_content = <ChangeDetailInfoIndex viewCallback={this.onViewCallback} {...this.state} />
        break;
      case "Delete":
      case "Manage":
      default:
        //除查询外，其他扩展按钮数组
        let extendButtons = [];
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({ UserSelecteds: selectedRowKeys,sureList:selectedRows })
            },
            getCheckboxProps: record => ({
              disabled: false,    // Column configuration not to be checked
            }),
          };
        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '资料类型'
                    >
                    {
                        getFieldDecorator('materialType',{ initialValue:this.state.pagingSearch.materialType})(
                          <Select>
                              <Option value=''>全部</Option>
                              {
                                this.state.material_type.map(item=>{
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
                    label = '是否打包资料'
                    >
                    {
                        getFieldDecorator('isPack',{ initialValue:this.state.pagingSearch.isPack})(
                        <Select>
                            <Option value="">全部</Option>
                            {
                            this.state.dic_YesNo.map(item=>{
                                return <Option value={item.value}>{item.title}</Option>
                            })
                            }
                        </Select>
                        )
                    }
                    </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    {getFieldDecorator('itemId', {
                      initialValue: this.state.pagingSearch.itemId
                    })(

                      <SelectItem
                          scope={'my'}
                          hideAll={false}
                          // hidePleaseSelect={true}
                          // isFirstSelected={true}
                          onSelectChange={(value) => {
                            this.state.pagingSearch.itemId = value;
                            this.state.pagingSearch.courseCategoryId = '';
                            this.setState({ pagingSearch: this.state.pagingSearch });
                            setTimeout(() => {
                                {/* 重新重置科目项 */ }
                                this.props.form.resetFields(['courseCategoryId']);
                                this.onSearch();
                            }, 500);
                          }}
                        />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '科目'
                    >
                    {
                        getFieldDecorator('courseCategoryId',{ initialValue:this.state.pagingSearch.courseCategoryId})(
                        <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                        )
                    }
                    </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"资料名称"}
                  >
                    {getFieldDecorator('materialName', { initialValue: this.state.pagingSearch.materialName })(
                      <Input />
                    )}
                  </FormItem>
                </Col>     
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'教师'} >
                    {getFieldDecorator('teacherId', { 
                        initialValue: 
                        (!this.state.teacherInfo.length ? [] : [{
                            id: this.state.teacherInfo[0].id,
                            name: this.state.teacherInfo[0].name
                          }]) 
                          })(
                      <EditableTeacher  maxTags={1} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   rowSelection={rowSelection}
                   scroll={{ x: 1300 }}
            />
            <div className="space-default"></div>
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={3}>
                  {
                    this.state.UserSelecteds.length>0?<Button onClick={this.onSubmit} icon="calendar">确定</Button>:<Button disabled icon="calendar">确定</Button>
                  }
                    
                </Col>
                <Col span={2}>
                  <Button onClick={this.props.handleCancel} icon="rollback">取消</Button>
                </Col>
                <Col span={19} className='search-paging-control'>
                  <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}
                      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                </Col>
              </Row>
            </div>
          </div>
        </div>);
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(StudentStudyInfo);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    DetailsOfInformation: bindActionCreators(DetailsOfInformation, dispatch), 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
